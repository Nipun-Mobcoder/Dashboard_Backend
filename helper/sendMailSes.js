import { SendEmailCommand } from '@aws-sdk/client-ses';
import ejs from 'ejs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { sendMail } from '../config/s3.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendMailSES = async (userName, email, fileName ,subject , complaintMessage, refundAmount, recieverEmail, Date) => {
  try {
    const templatePath = path.join(__dirname, fileName);
    const emailHTML = await ejs.renderFile(templatePath, {
      userName,
      email,
      platform: process.env.SEND_MAIL,
      complaintMessage, 
      refundAmount, 
      recieverEmail, 
      Date
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
            Data: subject
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
