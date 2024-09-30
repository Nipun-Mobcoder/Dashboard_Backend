import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import ejs from 'ejs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { sendMail } from '../config/s3.js';

dotenv.config();

const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendMailSES = async (userName, email) => {
  try {
    const templatePath = path.join(__dirname, 'mail.ejs');
    const emailHTML = await ejs.renderFile(templatePath, {
      userName: userName,
      email: email,
      platform: process.env.SEND_MAIL
    });

    const params = {
        Source: 'nipun.bhardwaj@mobcoder.com',
        Destination: {
          ToAddresses: [email]
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: emailHTML
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Welcome to Our Service!'
          }
        }
      };

    const command = new SendEmailCommand(params);
    const sendMailToClient = await sendMail(command);
    console.log(`Email sent to ${email}`, sendMailToClient);
  } catch (error) {
    console.error('Error sending email:', error.response?.body || error.message);
    throw new Error('Failed to send welcome email.');
  }
};
