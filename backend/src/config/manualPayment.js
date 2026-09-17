// Manual UPI payment configuration.
// Owner payee details are shown to the user at checkout.
// Configure via environment variables; sensible defaults match owner's UPI.
module.exports = {
  payeeName: process.env.MANUAL_PAYEE_NAME || "Ashish Saval",
  merchantLabel: process.env.MANUAL_MERCHANT_LABEL || "HireMind AI",
  // Primary + secondary UPI IDs shown in the modal (both belong to owner)
  upiIds: [
    process.env.MANUAL_UPI_PRIMARY || "7420873636@axl",
    process.env.MANUAL_UPI_SECONDARY || "7420873636@ybl",
  ].filter(Boolean),
  // Web-accessible QR paths:
  // - Frontend (Vite): /upi-qr.jpg  (copied from owner's QR image into frontend/public)
  // - Backend static:  /uploads/upi-qr.jpg
  qrImageUrl: process.env.MANUAL_QR_IMAGE_URL || "/upi-qr.jpg",
  qrBackendUrl: "/uploads/upi-qr.jpg",
  supportEmail: process.env.MANUAL_SUPPORT_EMAIL || "support@hiremind.ai",
  // UTR / UPI Ref No is typically 12 digits. We accept 6-22 alphanumerics
  // to cover UPI Ref / UTR / RRN variants across GPay/PhonePe/Paytm/BHIM.
  utrPattern: /^[A-Za-z0-9]{6,22}$/,
};
