import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { tokenValidator } from '../middlewares/auth/tokenValidation';
import { validate } from '../middlewares/validate';
// Removed userId-based operations per updated requirements
import {
  getMe,
  getUserByEmail,
  patchUserByEmail,
  uploadProfileImage,
  uploadResume,
  uploadCertifications,
} from '../controllers/user.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const skillSchema = z.object({
  name: z.string().min(1),
  level: z.string().min(1).optional(),
  years: z.coerce.number().int().min(0).optional(),
});

const qualificationSchema = z.object({
  title: z.string().min(1),
  institution: z.string().min(1),
  year: z.coerce.number().int(),
});

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  link: z.string().url().optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  duration: z.string().min(1),
  description: z.string().min(1).optional(),
});

// Validation schema for PATCH by email (limited editable fields)
const patchByEmailSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50).optional(),
  phone: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  links: z.array(z.string().url()).optional(),
  skills: z.array(z.union([z.string().min(1), skillSchema])).optional(),
  qualifications: z.array(qualificationSchema).optional(),
  experience: z.array(z.union([z.string().min(1), experienceSchema])).optional(),
}).strip(); // strip unknown keys silently to avoid front-end token injection noise

// Get current user profile
router.get('/me', tokenValidator, getMe);

// Get user by email (must be before :id route to avoid conflict if email matches pattern)
router.post('/email', tokenValidator, (req, res, next) => {
  const email = req.body.email;
  // Basic email pattern check to short-circuit obvious invalid cases
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });
  return getUserByEmail(req, res);
});

// Patch user profile by email (partial update)
router.patch('/email', tokenValidator, validate(patchByEmailSchema), patchUserByEmail);

// Uploads
router.post('/me/profile-image', tokenValidator, upload.single('file'), uploadProfileImage);
router.post('/me/resume', tokenValidator, upload.single('file'), uploadResume);
router.post('/me/certifications', tokenValidator, upload.array('files'), uploadCertifications);

export default router;
