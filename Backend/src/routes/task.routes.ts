import express from "express";
import { tokenValidator } from "../middlewares/auth/tokenValidation";
import Task from "../models/Task.model";

const router = express.Router();

router.get('/', tokenValidator, async (req, res) => {
  try {
    const tasks = await Task
      .find({}, { name: 1, _id: 1 })
      .lean()
      .exec();
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

export default router;