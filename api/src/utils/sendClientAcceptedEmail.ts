import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // port 587 uses STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendClientAcceptedEmail = async (
  email: string,
  clientCode: string,
  setupToken: string,
) => {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("FRONTEND_URL is not configured.");
  }

  const createPasswordUrl = `${frontendUrl}/create-password?token=${encodeURIComponent(setupToken)}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: email,
    subject: "Your client account has been approved",
    text: `
Your client account has been approved.

Client Code: ${clientCode}

Please use the following link to create your password:
${createPasswordUrl}

Once you create your password, you will be able to log in to the customer portal.

If you did not request this account, please contact support.
    `.trim(),

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Your client account has been approved</h2>

        <p>
          Your client account has been successfully approved.
        </p>

        <p>
          <strong>Client Code:</strong>
          <span>${clientCode}</span>
        </p>

        <p>
          Please click the button below to create your password:
        </p>

        <p>
          <a
            href="${createPasswordUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background-color: #006FEE;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Create Your Password
          </a>
        </p>

        <p>
          After creating your password, you can use your client code
          and password to log in to the customer portal.
        </p>

        <p>
          If you did not request this account, please contact support.
        </p>
      </div>
    `,
  });
};
