import sgMail from '@sendgrid/mail';
import ejs from 'ejs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendMail = async (userName, email) => {
  try {
    const templatePath = path.join(__dirname, 'mail.ejs');
    const emailHTML = await ejs.renderFile(templatePath, {
      userName: userName,
      email: email,
      platform: process.env.SEND_MAIL
    });

    const msg = {
      to: email,
      from: {name: 'Admin', email: 'nipun.bhardwaj@mobcoder.com'},
      subject: 'Welcome to Our Service!',
      html: emailHTML, 
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error.response?.body || error.message);
    throw new Error('Failed to send welcome email.');
  }
};
