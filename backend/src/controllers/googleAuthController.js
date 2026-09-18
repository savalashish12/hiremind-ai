// Google OAuth 2.0 login — issues the SAME standard JWT as password login
// (payload { id, role }, 7d expiry), so all existing protect/authorizeRoles
// middleware and the frontend AuthContext keep working unchanged.
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const logActivity = require("../utils/activityLogger");
const {
  isConfigured,
  getAuthUrl,
  exchangeCode,
  verifyIdToken,
} = require("../services/googleAuth");

const ALLOWED_SIGNUP_ROLES = ["CANDIDATE", "RECRUITER"];

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const toSafeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
});

// Find-or-create a user from a verified Google profile, then issue a JWT.
// New accounts are auto-verified (Google already verified the email).
// Existing emails keep their current role (never escalated, never ADMIN-created).
const loginWithGoogleProfile = async (profile, requestedRole, req) => {
  const role =
    ALLOWED_SIGNUP_ROLES.includes(requestedRole) ? requestedRole : "CANDIDATE";

  let user = await prisma.user.findUnique({ where: { email: profile.email } });

  if (user) {
    if (user.isSuspended) {
      const err = new Error(
        "Your account has been suspended. Please contact the administrator."
      );
      err.statusCode = 403;
      throw err;
    }
  } else {
    // Satisfy the required `password` column with an unusable random secret.
    const randomPassword = await bcrypt.hash(crypto.randomBytes(32), 10);
    user = await prisma.user.create({
      data: {
        fullName: profile.fullName,
        email: profile.email,
        password: randomPassword,
        role,
        isVerified: true,
        verifyToken: null,
      },
    });
    logActivity({
      userId: user.id,
      action: "REGISTER",
      entity: "Auth",
      details: `${profile.email} registered via Google as ${role}`,
      req,
    });
  }

  const token = signToken(user);
  logActivity({
    userId: user.id,
    action: "LOGIN",
    entity: "Auth",
    details: `${user.email} logged in via Google`,
    req,
  });
  return { token, user: toSafeUser(user) };
};

// GET /api/auth/google/url?role=CANDIDATE — step 1 of redirect flow.
const googleAuthUrl = (req, res) => {
  if (!isConfigured()) {
    return res.status(500).json({
      message: "Google OAuth is not configured on the server.",
    });
  }
  const { role } = req.query;
  return res.status(200).json({ url: getAuthUrl(role) });
};

// GET /api/auth/google/callback?code=...&state=... — step 2 of redirect flow.
// Exchanges the code, verifies the ID token, issues a JWT and redirects to
// the frontend which persists it exactly like a normal login.
const googleCallback = async (req, res) => {
  if (!isConfigured()) {
    return res.status(500).json({ message: "Google OAuth is not configured." });
  }
  const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
  const fail = (message) =>
    res.redirect(
      `${frontend}/login?google_error=${encodeURIComponent(message)}`
    );
  try {
    const { code, state, error } = req.query;
    if (error) return fail(String(error));
    if (!code) return fail("Missing authorization code");

    let requestedRole = "CANDIDATE";
    try {
      const parsed = JSON.parse(state || "{}");
      if (parsed.role) requestedRole = parsed.role;
    } catch {
      /* ignore malformed state */
    }

    const tokens = await exchangeCode(String(code));
    if (!tokens.id_token) return fail("Google did not return an ID token");
    const profile = await verifyIdToken(tokens.id_token);
    const { token, user } = await loginWithGoogleProfile(
      profile,
      requestedRole,
      req
    );

    const payload = encodeURIComponent(
      JSON.stringify({ token, user })
    );
    return res.redirect(`${frontend}/login?google_auth=${payload}`);
  } catch (err) {
    console.error("Google callback error:", err.message);
    return fail("Google sign-in failed. Please try again.");
  }
};

// POST /api/auth/google { idToken, role? } — GIS one-tap / button flow.
// The frontend sends the Google credential directly; no redirect needed.
const googleLogin = async (req, res) => {
  if (!isConfigured()) {
    return res.status(500).json({
      message: "Google OAuth is not configured on the server.",
    });
  }
  try {
    const { idToken, role } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }
    const profile = await verifyIdToken(String(idToken));
    const { token, user } = await loginWithGoogleProfile(profile, role, req);
    return res.status(200).json({
      message: "Google login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Google login error:", error.message);
    const status = error.statusCode || 401;
    return res
      .status(status)
      .json({ message: error.message || "Google sign-in failed" });
  }
};

module.exports = {
  googleAuthUrl,
  googleCallback,
  googleLogin,
};
