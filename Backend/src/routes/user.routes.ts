import express from 'express';
import multer from 'multer';
import { tokenValidator } from '../middlewares/auth/tokenValidation';
import { validate } from '../middlewares/validate';
import { userIdParamSchema, userUpdateSchema } from '../validators/user.schema';
import {
  getMe,
  getUserById,
  updateMe,
  uploadProfileImage,
  uploadResume,
  uploadCertifications,
} from '../controllers/user.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get current user profile
router.get('/me', tokenValidator, getMe);

// Get user by id (public or protected as needed; here keep protected)
router.get('/:id', tokenValidator, validate(userIdParamSchema, 'params'), getUserById);

// Update current user (bio, links, experience, skills, portfolio)
router.put('/me', tokenValidator, validate(userUpdateSchema), updateMe);

// Uploads
router.post('/me/profile-image', tokenValidator, upload.single('file'), uploadProfileImage);
router.post('/me/resume', tokenValidator, upload.single('file'), uploadResume);
router.post('/me/certifications', tokenValidator, upload.array('files'), uploadCertifications);

export default router;
