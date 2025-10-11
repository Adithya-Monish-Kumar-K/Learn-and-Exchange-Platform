import express from 'express';
import {
  getUserStats,
  getTaskStats,
  getOfferStats,
  getReviewStats,
  getAllStats,
} from '../controllers/stats.controller';
import { tokenValidator } from '../middlewares/auth/tokenValidation';

const router = express.Router();

router.get('/users', tokenValidator, getUserStats);
router.get('/tasks', tokenValidator, getTaskStats);
router.get('/offers', tokenValidator, getOfferStats);
router.get('/reviews', tokenValidator, getReviewStats);
router.get('/all', tokenValidator, getAllStats);

export default router;
