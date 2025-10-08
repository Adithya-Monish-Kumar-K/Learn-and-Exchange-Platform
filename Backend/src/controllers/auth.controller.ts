import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

import User from '../models/User.model';
import {
  createToken,
  createRefreshToken,
} from '../middlewares/auth/tokenCreation';

import { sendregisterEmail, sendforgotEmail } from '../middlewares/mail/mail';

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({
        message: 'Email and name are required',
      });
    }

    let rollNo = req.body.rollNo;
    if (!rollNo && email) {
      const emailPrefix = email.split('@')[0];
      rollNo = emailPrefix;
    }

    res.status(200).json({
      status: 200,
      message: 'Token is valid, verified',
      user: {
        email,
        name,
        rollNo,
      },
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({
      message: 'An error occurred during token verification',
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberme } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    if (!user.isActive) {
      return res
        .status(400)
        .json({ message: 'User is inactive. Please contact support.' });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const userData = {
      userid: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };

    const token = await createToken(userData);
    const refreshToken = createRefreshToken(userData, rememberme);

    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };
    if (rememberme) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    res.cookie('refreshToken', refreshToken, cookieOptions);
    
    const { secret_key, ...filteredUserData } = userData as any;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: filteredUserData,
    });
    } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyMainToken = async (req: Request, res: Response) => {
  try {
    // tokenValidator now attaches decoded claims to req.auth instead of mutating req.body
    const auth = (req as any).auth as {
      email?: string;
      name?: string;
      userid?: string;
      role?: string;
      isActive?: boolean;
    } | undefined;

    if (!auth || !auth.email) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Fetch fresh user document to include latest phone / verification state
    const user = await User.findOne({ email: auth.email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    return res.status(200).json({
      status: 200,
      message: 'Token is valid',
      user: {
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, name, phone } = req.body;

    if (!email || !name || !phone) {
      return res
        .status(400)
        .json({ message: 'Email, name, and phone number are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    await sendregisterEmail(email, name, phone);

    res.status(200).json({
      status: 200,
      message: 'Successfully email sent to user',
      email,
      phone,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  let session: mongoose.ClientSession | null = null;
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        message: 'Email, password, name, and phone number are required',
      });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Email already exists' });
    }

    const formattedName =
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    const newUser = new User({
      email,
      password,
      name: formattedName,
      phone,
      role: 'user',
      isActive: true,
      isVerified: false,
    });

    await newUser.save({ session });
    await session.commitTransaction();

    return res.status(201).json({
      status: 200,
      message: 'User created successfully',
      user: {
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error('Error in setPassword:', error);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    if (session) session.endSession();
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'email is required' });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: 'email does not exist' });
    }

    const { name } = existingUser;

    if (!name) {
      return res.status(400).json({ message: 'User name not found' });
    }

    await sendforgotEmail(email, name);

    res.status(200).json({
      status: 200,
      message: 'Successfully email sent to user',
      email,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  let session: mongoose.ClientSession | null = null;
  try {
    const { password, email } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Email does not exist' });
    }

    existingUser.password = password;

    await existingUser.save({ session });
    await session.commitTransaction();

    return res.status(200).json({
      status: 200,
      message: 'Password updated successfully',
      user: {
        email: existingUser.email,
        name: existingUser.name,
      },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error('Error in resetPassword:', error);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    if (session) session.endSession();
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: 'Refresh token required' });

  try {
    const userData = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET_KEY as string
    );

    const { userid, email, name, role, isActive } = userData as any;
    const token = await createToken({ userid, email, name, role, isActive });
    res.json({ token });
  } catch (err) {
    return res
      .status(403)
      .json({ message: 'Invalid or expired refresh token' });
  }
};
