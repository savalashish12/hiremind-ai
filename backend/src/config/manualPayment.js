// Manual UPI payment configuration.
// Owner payee details are shown to the user at checkout.
// Configure via environment variables (see backend/.env.example).
// Fallbacks are intentionally blank — real IDs live ONLY in the server .env,
// never hardcoded in tracked code.
module.exports = {
  payeeName: process.env.MANUAL_PAYEE_NAME || "",
  merchantLabel: process.env.MANUAL_MERCHANT_LABEL || "HireMind AI",
  // Primary + secondary UPI IDs shown in the modal (both belong to owner)
  upiIds: [
    process.env.MANUAL_UPI_PRIMARY || "",
    process.env.MANUAL_UPI_SECONDARY || "",
  ].filter(Boolean),
  // Web-accessible QR paths:
  // - Frontend (Vite): /upi-qr.jpg  (copied from owner's QR image into frontend/public)
  // - Backend static:  /uploads/upi-qr.jpg
  qrImageUrl: process.env.MANUAL_QR_IMAGE_URL || "/upi-qr.jpg",
  qrBackendUrl: "/uploads/upi-qr.jpg",
  supportEmail: process.env.MANUAL_SUPPORT_EMAIL || "",
  // UTR / UPI Ref No is typically 12 digits. We accept 6-22 alphanumerics
  // to cover UPI Ref / UTR / RRN variants across GPay/PhonePe/Paytm/BHIM.
  utrPattern: /^[A-Za-z0-9]{6,22}$/,
};
