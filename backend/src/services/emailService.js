const nodemailer =
  require("nodemailer");

// Configurable SMTP (any provider) with Gmail-service fallback.
// Env:
//   EMAIL_HOST (e.g. smtp.gmail.com) — if unset, falls back to Gmail service mode
//   EMAIL_PORT (default 587), EMAIL_SECURE=true for port 465 SSL
//   EMAIL_USER, EMAIL_PASS (Gmail: an App Password, not the login password)
//   EMAIL_FROM (e.g. "HireMind AI <noreply@yourdomain.com>") — defaults to EMAIL_USER
const buildTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (host) {
    const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
    const secure =
      String(process.env.EMAIL_SECURE || "").toLowerCase() === "true" ||
      port === 465;
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  // Legacy Gmail-service mode (kept for backward compatibility)
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

const transporter = buildTransporter();

const FROM =
  process.env.EMAIL_FROM ||
  process.env.EMAIL_USER ||
  "noreply@hiremind.ai";

// Non-blocking SMTP check at boot — logs status, never crashes the server.
transporter
  .verify()
  .then(() => console.log("[EMAIL] SMTP transporter ready"))
  .catch((err) =>
    console.warn(
      "[EMAIL] SMTP not reachable (emails will fail gracefully):",
      err.message
    )
  );

const sendStatusEmail =
  async (
    candidateEmail,
    candidateName,
    status,
    jobTitle
  ) => {

    try {

      let subject = "";

      let message = "";

      if (
        status ===
        "SHORTLISTED"
      ) {

        subject =
          "Application Shortlisted";

        message = `
Hello ${candidateName},

Congratulations!

You have been shortlisted for the role:

${jobTitle}

Our recruitment team will contact you soon.

Regards,
HireMind AI
`;
      }

      if (
        status ===
        "REJECTED"
      ) {

        subject =
          "Application Update";

        message = `
Hello ${candidateName},

Thank you for applying for:

${jobTitle}

After review, we will not proceed further at this stage.

We appreciate your interest.

Regards,
HireMind AI
`;
      }

      await transporter.sendMail({

        from: FROM,

        to: candidateEmail,

        subject,

        text: message,
      });

      console.log(
        "Email sent successfully"
      );

    } catch (error) {

      console.log(error);
    }
  };

const sendInterviewEmail = async (
  candidateEmail,
  candidateName,
  jobTitle,
  date,
  time,
  link,
  notes
) => {
  try {
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const subject = `Interview Scheduled: ${jobTitle}`;
    const message = `
Hello ${candidateName},

We are pleased to invite you for an interview for the position of "${jobTitle}".

Here are the details:
Date: ${formattedDate}
Time: ${time || "As scheduled"}
Meeting Link: ${link}

${notes ? `Interviewer Notes:\n${notes}\n` : ""}
Best regards,
HireMind AI Recruitment Team
`;

    await transporter.sendMail({
      from: FROM,
      to: candidateEmail,
      subject,
      text: message,
    });

    console.log("Interview invitation email sent successfully.");
  } catch (error) {
    console.log("Error sending interview email: ", error);
  }
};

const sendOfferEmail = async (
  toEmail,
  candidateName,
  jobTitle,
  offerUrl
) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: toEmail,
      subject: `Offer Letter Issued: ${jobTitle}`,
      text: `Hello ${candidateName},\n\nCongratulations! An official offer letter has been issued for the role of "${jobTitle}".\n\nView / download it here:\n${offerUrl}\n\nPlease accept or decline it from your HireMind AI dashboard (My Applications).\n\nRegards,\nHireMind AI`,
    });
    console.log("Offer email sent to", toEmail);
  } catch (error) {
    console.log("Error sending offer email: ", error);
  }
};

const sendVerificationEmail = async (toEmail, name, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email/${token}`;
  await transporter.sendMail({
    from: FROM,
    to: toEmail,
    subject: "Verify your HireMind AI email",
    text: `Hello ${name},\n\nThanks for registering on HireMind AI.\nClick to verify your email:\n${verifyUrl}\n\nThis link expires once used. If you did not register, ignore this email.\n\nRegards,\nHireMind AI`,
  });
  console.log("Verification email sent to", toEmail);
};

const sendPasswordOtpEmail = async (toEmail, name, otp) => {
  await transporter.sendMail({
    from: FROM,
    to: toEmail,
    subject: "HireMind AI password reset OTP",
    text: `Hello ${name},\n\nYour password reset OTP is: ${otp}\nIt expires in 15 minutes.\n\nIf you did not request this, ignore this email.\n\nRegards,\nHireMind AI`,
  });
  console.log("Password reset OTP sent to", toEmail);
};

module.exports = {
  sendStatusEmail,
  sendInterviewEmail,
  sendOfferEmail,
  sendVerificationEmail,
  sendPasswordOtpEmail,
};
