import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendClientRejectedEmail = async (
  email: string,
  clientCode: string,
) => {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("FRONTEND_URL is not configured.");
  }

  const registrationUrl = `${frontendUrl}/register`;

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: email,
      subject: `Client Registration Request (${Date.now()})`,
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Registration Request</h2>

        <p>
          Your client registration request could not be approved at this time.
        </p>

        <p>
          Please retry your registration using the button below:
        </p>

        <p>
          <a
            href="${registrationUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background-color: #006FEE;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Retry Registration
          </a>
        </p>

        <p>
          <strong>Client Code:</strong> ${clientCode}
        </p>

        <p>
          If you need assistance, please contact support.
        </p>
      </div>
    `,
    });

    console.log("Rejection email sent:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    return info;
  } catch (error) {
    console.error("Failed to send Rejection email:", error);
    throw new Error("Failed to send Rejection email");
  }
};
