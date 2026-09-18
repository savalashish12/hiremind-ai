// Google OAuth 2.0 helper built on google-auth-library's OAuth2Client.
// Supports two flows with the same client:
//   1. One-tap / GIS credential flow  -> verifyIdToken(idToken)
//   2. Redirect (code) flow           -> getAuthUrl() + exchangeCode(code)
// Required env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
// Optional env: GOOGLE_REDIRECT_URI (defaults to <BACKEND_URL>/api/auth/google/callback)
const { OAuth2Client } = require("google-auth-library");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const getRedirectUri = () =>
  process.env.GOOGLE_REDIRECT_URI ||
  `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`;

const isConfigured = () => Boolean(CLIENT_ID && CLIENT_SECRET);

const getClient = () =>
  new OAuth2Client(CLIENT_ID, CLIENT_SECRET, getRedirectUri());

// Step 1 of redirect flow: build the Google consent URL.
// `role` travels through `state` so a first-time user keeps their chosen role.
const getAuthUrl = (role = "CANDIDATE") => {
  const client = getClient();
  return client.generateAuthUrl({
    access_type: "online",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
    state: JSON.stringify({ role }),
  });
};

// Step 2 of redirect flow: exchange ?code= for tokens.
const exchangeCode = async (code) => {
  const client = getClient();
  const { tokens } = await client.getToken(code);
  return tokens; // { id_token, access_token, ... }
};

// Verify a Google ID token (from GIS credential OR code exchange) and
// return the normalized profile { googleId, email, fullName, avatar }.
const verifyIdToken = async (idToken) => {
  const client = getClient();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error("Invalid Google token payload");
  }
  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    fullName: payload.name || payload.email.split("@")[0],
    avatar: payload.picture || null,
    emailVerified: payload.email_verified !== false,
  };
};

module.exports = {
  isConfigured,
  getRedirectUri,
  getAuthUrl,
  exchangeCode,
  verifyIdToken,
};
