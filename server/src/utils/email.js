const nodemailer = require('nodemailer');

let transporter;

async function createTestTransporter() {
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email System] Connected to Ethereal Email account: ${testAccount.user}`);
  }
  return transporter;
}

const sendEmail = async (to, subject, html) => {
  try {
    const tp = await createTestTransporter();
    const info = await tp.sendMail({
      from: '"MediLink System" <noreply@medilink.com>',
      to,
      subject,
      html,
    });
    console.log(`\n======================================================`);
    console.log(`📧 EMAIL SENT TO: ${to}`);
    console.log(`📝 SUBJECT: ${subject}`);
    console.log(`🔍 PREVIEW URL: ${nodemailer.getTestMessageUrl(info)}`);
    console.log(`======================================================\n`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail };
