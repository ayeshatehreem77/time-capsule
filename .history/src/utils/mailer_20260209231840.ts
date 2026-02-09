import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

export async function getMailer() {
  if (!transporter) {
    // Generate a test account (Ethereal)
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('Ethereal Email Test Account:');
    console.log('User:', testAccount.user);
    console.log('Pass:', testAccount.pass);
  }
  return transporter;
}
