import express from 'express';
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
} from '../controllers/chat.controller';
import { tokenValidator } from '../middlewares/auth/tokenValidation';

const router = express.Router();

router.get('/sidebar', tokenValidator, getUsersForSidebar);
router.get('/messages/:id', tokenValidator, getMessages);
router.post('/send/:id', tokenValidator, sendMessage);

export default router;