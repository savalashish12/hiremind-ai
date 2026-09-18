const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { sendVerificationEmail, sendPasswordOtpEmail } = require('../services/emailService');
const logActivity = require('../utils/activityLogger');

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role,
        isVerified: false,
        verifyToken,
      },
    });

    // Best-effort verification email (register must not fail if SMTP is down)
    try {
      await sendVerificationEmail(email, fullName, verifyToken);
    } catch (e) {
      console.error('Verification email failed:', e.message);
    }

    logActivity({ userId: user.id, action: 'REGISTER', entity: 'Auth', details: `${email} registered as ${role}`, req });

    res.status(201).json({
      message: 'User registered successfully. Please verify your email before logging in.',

      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        message: 'Your account has been suspended. Please contact the administrator.',
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: 'Please verify your email before logging in.',
        needsVerification: true,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    logActivity({ userId: user.id, action: 'LOGIN', entity: 'Auth', details: `${email} logged in`, req });

    res.status(200).json({
      message: 'Login successful',
      token,

      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
  });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateCandidateProfile = async (req, res) => {
  try {
    const { linkedinUrl, githubUrl, portfolioUrl, profileImage, certifications } = req.body;
    const userId = req.user.id;

    // Convert certifications to string array if it is passed as a string
    let certsArray = [];
    if (Array.isArray(certifications)) {
      certsArray = certifications;
    } else if (typeof certifications === 'string') {
      certsArray = certifications.split(',').map(s => s.trim()).filter(Boolean);
    }

    const profile = await prisma.candidateProfile.upsert({
      where: { userId },
      update: {
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        profileImage,
        certifications: certsArray,
      },
      create: {
        userId,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        profileImage,
        certifications: certsArray,
      },
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        candidateProfile: true,
        recruiterProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }
    const user = await prisma.user.findFirst({ where: { verifyToken: token } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link.' });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verifyToken: null },
    });
    res.status(200).json({ success: true, message: 'Email verified! You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified. Please login.' });
    }
    const verifyToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({ where: { id: user.id }, data: { verifyToken } });
    try {
      await sendVerificationEmail(user.email, user.fullName, verifyToken);
    } catch (e) {
      console.error('Verification email failed:', e.message);
      return res.status(500).json({ message: 'Failed to send verification email. Try again later.' });
    }
    res.status(200).json({ success: true, message: 'Verification email resent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond success to avoid email enumeration
    if (!user) {
      return res.status(200).json({ success: true, message: 'OTP sent to email' });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtp: hashedOtp, resetOtpExpiry: new Date(Date.now() + 15 * 60 * 1000) },
    });
    try {
      await sendPasswordOtpEmail(user.email, user.fullName, otp);
    } catch (e) {
      console.error('OTP email failed:', e.message);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] Password reset OTP for ${user.email}: ${otp}`);
        return res.status(200).json({ success: true, message: 'OTP sent to email' });
      }
      return res.status(500).json({ message: 'Failed to send OTP email. Try again later.' });
    }
    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and new password are required.' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Request a new one.' });
    }
    if (user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }
    const isMatch = await bcrypt.compare(String(otp), user.resetOtp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetOtp: null, resetOtpExpiry: null },
    });
    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateCandidateProfile,
  getUserProfile,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};