import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

import User from '../models/User.model';
import {
  createToken,
  createRefreshToken,
} from '../middlewares/auth/tokenCreation';
import { sendregisterEmail, sendforgotEmail } from '../middlewares/mail/mail';

const REFRESH_COOKIE_NAME = 'refreshToken';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // true in production
    sameSite: 'strict',
    path: '/api/auth', // restrict to auth endpoints
    maxAge: 7 * 24 * 60 * 60 * 1000, // fallback (7d) – actual lifetime enforced by token exp
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    path: '/api/auth',
  });
}

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

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

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

    const accessToken = await createToken({
      userid: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    });

    const refreshToken = createRefreshToken(
      {
        userid: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
      !!rememberme
    );

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      message: 'Login successful',
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
      },
    });
  } catch (err: any) {
    console.error('Error logging in user:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

export const verifyMainToken = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Token is valid',
      user: {
        email: user.email,
        name: user.name,
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
  try {
    const cookieToken = req.cookies?.refreshToken;
    if (!cookieToken) {
      return res.status(401).json({ message: 'Missing refresh token' });
    }

    // Verify refresh token (keep your existing verification logic)
    const decoded = jwt.verify(cookieToken, process.env.REFRESH_SECRET_KEY!);

    // Re-issue new access token
    const newAccessToken = await createToken({
      userid: (decoded as any).userid,
      email: (decoded as any).email,
      name: (decoded as any).name,
      role: (decoded as any).role,
      isActive: (decoded as any).isActive,
    });

    // Optional: rotate refresh token (recommended)
    // const rotatedRefresh = createRefreshToken({...}, true/false);
    // setRefreshCookie(res, rotatedRefresh);

    return res.status(200).json({
      message: 'Access token refreshed',
      token: newAccessToken,
    });
  } catch (err: any) {
    console.error('Refresh token error:', err.message);
    clearRefreshCookie(res);
    return res
      .status(401)
      .json({ message: 'Invalid or expired refresh token' });
  }
};

export const logoutUser = async (_req: Request, res: Response) => {
  clearRefreshCookie(res);
  return res.status(200).json({ message: 'Logged out' });
};
