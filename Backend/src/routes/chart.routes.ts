import express from 'express';
import {
  getTaskCompletionTrend,
  getUserRegistrationTrend,
  getReviewDistribution,
  getChatActivityTrend,
  getOfferStatusDistribution,
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
router.get('/chat-activity-trend', tokenValidator, getChatActivityTrend);
router.get(
  '/offer-status-distribution',
  tokenValidator,
  getOfferStatusDistribution
);

export default router;
