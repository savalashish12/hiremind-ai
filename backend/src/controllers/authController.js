const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

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

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({
      message: 'User registered successfully',

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

module.exports = {
  registerUser,
  loginUser,
  updateCandidateProfile,
  getUserProfile,
};