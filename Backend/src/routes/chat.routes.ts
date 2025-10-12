import express from 'express';
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  getChatRequests,
  addRequest,
  respondToRequest,
  editRequest,
  deleteRequest,
  editMessage,
  deleteMessage,
} from '../controllers/chat.controller';
import { tokenValidator } from '../middlewares/auth/tokenValidation';

const router = express.Router();

router.get('/sidebar', tokenValidator, getUsersForSidebar);
router.get('/messages/:id', tokenValidator, getMessages);
router.post('/send/:id', tokenValidator, sendMessage);
router.put('/messages/:chatId/:messageId', tokenValidator, editMessage);
router.delete('/messages/:chatId/:messageId', tokenValidator, deleteMessage);
router.post('/requests', tokenValidator, getChatRequests);
router.post('/requests/add', tokenValidator, addRequest);
router.post('/requests/:chatId/respond', tokenValidator, respondToRequest);
router.put('/requests/:id', tokenValidator, editRequest);
router.delete('/requests/:id', tokenValidator, deleteRequest);

export default router;
