import nodemailer from "nodemailer";

export async function sendVerificationEmail(to: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verifyUrl = `http://localhost:3000/api/verify?token=${token}`; 

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify your email",
    html: `<p>Click the link to verify your email:<br>
      <a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
}
