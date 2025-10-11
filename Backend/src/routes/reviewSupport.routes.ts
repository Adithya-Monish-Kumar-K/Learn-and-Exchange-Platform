import { Router } from 'express';
import * as reviewSupportController from '../controllers/reviewSupport.controller';

const router = Router();

// Review routes
router.get('/reviews', reviewSupportController.getReviews);
router.post('/reviews', reviewSupportController.addReview);
router.post('/reviews/add', reviewSupportController.addReview);
router.put('/reviews/update/:id', reviewSupportController.updateReview);
router.delete('/reviews/delete/:id', reviewSupportController.deleteReview);

// SupportTicket routes
router.get('/tickets', reviewSupportController.getTickets);
router.post('/tickets', reviewSupportController.addTicket);
router.post('/tickets/add', reviewSupportController.addTicket);
router.put('/tickets/update/:id', reviewSupportController.updateTicket);
router.delete('/tickets/delete/:id', reviewSupportController.deleteTicket);

// Task routes
router.get('/tasks', reviewSupportController.getTasks);
router.post('/tasks/add', reviewSupportController.addTask);
router.put('/tasks/update/:id', reviewSupportController.updateTask);
router.delete('/tasks/delete/:id', reviewSupportController.deleteTask);

// User routes
router.get('/users', reviewSupportController.getUsers);
router.post('/users/add', reviewSupportController.addUser);
router.put('/users/update/:id', reviewSupportController.updateUser);
router.delete('/users/delete/:id', reviewSupportController.deleteUser);

export default router;
