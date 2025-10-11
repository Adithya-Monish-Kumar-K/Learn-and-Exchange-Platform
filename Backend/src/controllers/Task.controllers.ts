import { Request, Response } from "express";
import { Types } from "mongoose";
import Task from "../models/Task.model";

// Allowed status values
const STATUS = ["Pending", "Assigned", "In Progress", "Completed", "Cancelled"];

// Create Task
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, postedBy, deadline, requirements, attachments, offer } = req.body;

    if (!postedBy) return res.status(400).json({ error: "postedBy is required" });

    const newTask = new Task({
      title,
      description,
      postedBy,
      deadline: deadline ? new Date(deadline) : null,
      requirements: requirements || [],
      attachments: attachments || [],
      offer: offer || [],
      status: "Pending",
      applicants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Get all tasks
export const getTasks = async (_req: Request, res: Response) => {
  try {
    const tasks = await Task.find()
      .populate("postedBy", "username email")
      .populate("assignedTo", "username email")
      .populate("applicants", "username email");

    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get task by ID
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid task ID" });

    const task = await Task.findById(id)
      .populate("postedBy", "username email")
      .populate("assignedTo", "username email")
      .populate("applicants", "username email");

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid task ID" });

    const { requirements, attachments, status, ...rest } = req.body;

    const updateData: any = { ...rest, updatedAt: new Date() };

    if (requirements) updateData.requirements = requirements;
    if (attachments) updateData.attachments = attachments;
    if (status && STATUS.includes(status)) updateData.status = status;

    const task = await Task.findByIdAndUpdate(id, updateData, { new: true })
      .populate("postedBy", "username email")
      .populate("assignedTo", "username email")
      .populate("applicants", "username email");

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Delete task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid task ID" });

    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Apply to task
export const applyToTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid ID(s)" });

    const task = await Task.findByIdAndUpdate(
      id,
      { $addToSet: { applicants: userId }, updatedAt: new Date() },
      { new: true }
    ).populate("applicants", "username email");

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Assign task
export const assignTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid ID(s)" });

    const task = await Task.findByIdAndUpdate(
      id,
      { assignedTo: userId, status: "In Progress", updatedAt: new Date() },
      { new: true }
    )
      .populate("assignedTo", "username email")
      .populate("applicants", "username email");

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Complete task
export const completeTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid task ID" });

    const task = await Task.findByIdAndUpdate(
      id,
      { status: "Completed", updatedAt: new Date() },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getTaskStats = async (_req: Request, res: Response) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: { $toLower: { $ifNull: ["$status", "unknown"] } },
          count: { $sum: 1 },
        },
      },
    ]);

    const result: Record<string, number> = {
      open: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      unknown: 0,
    };

    stats.forEach((s: any) => {
      const key = String(s._id).toLowerCase().replace(/\s+/g, "_");
      if (key in result) result[key] = s.count;
      else result.unknown += s.count; 
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("getTaskStats error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

