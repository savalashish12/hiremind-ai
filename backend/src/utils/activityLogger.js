const prisma = require("../config/prisma");

// Central activity logger. Never throws — logging must not break the app.
const logActivity = async ({ userId, action, entity = null, entityId = null, details = "", req = null }) => {
  try {
    if (!userId || !action) return;
    let ipAddress = "unknown";
    if (req) {
      ipAddress =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "unknown";
    }
    await prisma.activityLog.create({
      data: { userId, action, entity, entityId, details: String(details).slice(0, 2000), ipAddress },
    });
  } catch (e) {
    console.error("Activity log failed:", e.message);
  }
};

module.exports = logActivity;
