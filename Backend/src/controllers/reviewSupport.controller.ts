import { Request, Response } from 'express';
import Review from '../models/Review.model';
import Task from '../models/Task.model';
import User from '../models/User.model';
import { SupportTicket } from '../models/supportTicket.model';

// Review CRUD
export const getReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

export const addReview = async (req: Request, res: Response) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    console.error('Add Review Error:', err);
  res.status(400).json({ error: 'Failed to add review', details: (err as any)?.message || err });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update review' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete review' });
  }
};

// SupportTicket CRUD
export const getTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await SupportTicket.find();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

export const addTicket = async (req: Request, res: Response) => {
  try {
    const ticket = new SupportTicket(req.body);
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add ticket' });
  }
};

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update ticket' });
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    await SupportTicket.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete ticket' });
  }
};

// Task CRUD
export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const addTask = async (req: Request, res: Response) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete task' });
  }
};

// User CRUD
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error('Add User Error:', err);
    res.status(400).json({ error: 'Failed to add user', details: (err as any)?.message || err });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete user' });
  }
};
