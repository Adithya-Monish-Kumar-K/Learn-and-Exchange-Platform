import express from 'express';
import {
  getTaskCompletionTrend,
  getUserRegistrationTrend,
  getReviewDistribution,
} from '../controllers/chart.controller';
import { tokenValidator } from '../middlewares/auth/tokenValidation';

const router = express.Router();

router.get('/task-completion-trend', tokenValidator, getTaskCompletionTrend);
router.get(
  '/user-registration-trend',
  tokenValidator,
  getUserRegistrationTrend
);
router.get('/review-distribution', tokenValidator, getReviewDistribution);

export default router;
