const nodemailer =
  require("nodemailer");

const transporter =
  nodemailer.createTransport({

    service: "gmail",

    auth: {

      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASS,
    },
  });

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

        from:
          process.env.EMAIL_USER,

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

module.exports = {
  sendStatusEmail,
};