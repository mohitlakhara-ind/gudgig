import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
  markAsRead
} from '../controllers/conversationController.js';

const router = express.Router();

router.use(protect);

router.get('/', getConversations);
router.post('/', [body('participantId').isString().notEmpty()], startConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);
router.put('/:id/read', markAsRead);

export default router;


