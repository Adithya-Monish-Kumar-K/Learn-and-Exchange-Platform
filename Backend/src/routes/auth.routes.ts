import express from 'express';
import {
  verifyToken,
  loginUser,
  verifyMainToken,
  registerUser,
  createUser,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
} from '../controllers/auth.controller';
import {
  tokenValidator,
  verifyRegisterToken,
  verifyForgotToken,
  readverifyForgotToken,
  readverifyRegisterTokens
} from '../middlewares/auth/tokenValidation';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/create-password', verifyRegisterToken, createUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', verifyForgotToken, resetPassword);
router.post('/refresh-token', refreshAccessToken);

// Token verification routes (protected)
router.get('/verify-token', tokenValidator, verifyMainToken);
router.get('/verify-token-forgot',  readverifyForgotToken, verifyToken);
router.get('/verify-token-register',readverifyRegisterTokens , verifyToken);

export default router;