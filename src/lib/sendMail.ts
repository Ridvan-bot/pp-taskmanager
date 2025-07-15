import nodemailer from 'nodemailer';

export async function sendVerificationEmail(to: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verifyUrl = `http://localhost:3000/api/verify?token=${token}`; // byt till din domän i produktion

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Bekräfta din e-post',
    html: `<p>Klicka på länken för att bekräfta din e-post:<br>
      <a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
} 