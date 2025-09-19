import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import {
  TEMPLATE_WELCOME_MAIL,
  TEMPLATE_RESET_MAIL
} from './template';
import { registermailtoken, forgotmailtoken } from '../auth/tokenCreation';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

// Function to send registration email
export const sendregisterEmail = async (
  email: string,
  name: string,
  phone: string,
): Promise<void> => {
  try {
    console.log('sendregisterEmail');
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const tokenData = { email, name, phone };
      const token = await registermailtoken(tokenData);
      console.log(token);

      const verificationUrl = `${process.env.STATIC_URL}/auth/password?token=${token}&type=register`;

      const htmlContent = TEMPLATE_WELCOME_MAIL(name, verificationUrl);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Skill Exchange – Verify Your Account',
        text: `Hello ${name},\n\nWelcome to Skill Exchange! Click the link below to verify your email and set your password:\n\n${verificationUrl}`,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
      console.log('Register email sent successfully ✅');
      await session.commitTransaction();
      session.endSession();
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error: any) {
    console.error('Error sending register email ❌:', error.response || error);
    throw new Error('Error sending register email');
  }
};

export const sendforgotEmail = async (
  email: string,
  name: string
): Promise<void> => {
  try {
    console.log('sendforgotEmail');
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const tokenData = { email, name };
      const token = await forgotmailtoken(tokenData);
      console.log(token);

      const verificationUrl = `${process.env.STATIC_URL}/auth/password?token=${token}&type=forgot`;

      const htmlContent = TEMPLATE_RESET_MAIL(name, verificationUrl);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Skill Exchange – Reset Your Password',
        text: `Hello ${name},\n\nClick the link below to reset your Skill Exchange password:\n\n${verificationUrl}`,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
      console.log('Forgot password email sent successfully ✅');
      await session.commitTransaction();
      session.endSession();
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error: any) {
    console.error('Error sending forgot password email ❌:', error.response || error);
    throw new Error('Error sending forgot password email');
  }
}