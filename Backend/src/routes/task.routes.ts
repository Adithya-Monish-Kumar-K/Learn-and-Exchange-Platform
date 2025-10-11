import { Router } from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  applyToTask,
  assignTask,
  completeTask,
  getTaskStats 
} from "../controllers/Task.controllers";



const router = Router();

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/apply", applyToTask);
router.post("/:id/assign", assignTask);
router.post("/:id/complete", completeTask);
router.get("/stats/summary", getTaskStats);


export default router;
