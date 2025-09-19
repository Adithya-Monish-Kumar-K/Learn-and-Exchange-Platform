import React, { useEffect, useState } from 'react';
import {
  getTasks,
  applyToTask,
  assignTask,
  completeTask,
  deleteTask,
} from '../services/taskService';
import TaskForm from './TaskForm';
import TaskEditForm from './TaskEditForm';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  const loadTasks = async () => {
    const data = await getTasks();
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
        </div>

        <button onClick={() => setEditingTask(true)}>View edit form</button>

        {!editingTask && <TaskForm onTaskCreated={loadTasks} />}
        {editingTask && (
          <div className="mb-6">
            <TaskEditForm
              task={editingTask}
              onTaskUpdated={() => {
                loadTasks();
                setEditingTask(null);
              }}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        )}

        <h2 className="text-lg font-semibold text-gray-700 mb-4">All Tasks</h2>
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-semibold text-gray-800">
                    {task.title}
                  </div>
                  <div className="text-sm text-gray-500">{task.status}</div>
                </div>
                <div className="text-sm text-gray-600 mt-2 italic">
                  {task.description}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Deadline:{' '}
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>

              <div className="mt-4 sm:mt-0 flex gap-2">
                <button
                  onClick={() => setEditingTask(task)}
                  className="px-3 py-1 rounded-md border text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    applyToTask(task._id, prompt('Enter User ID') || '')
                  }
                  className="px-3 py-1 rounded-md bg-yellow-100 text-yellow-700 text-sm"
                >
                  Apply
                </button>
                <button
                  onClick={() =>
                    assignTask(task._id, prompt('Assign to User ID') || '')
                  }
                  className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 text-sm"
                >
                  Assign
                </button>
                <button
                  onClick={() => completeTask(task._id)}
                  className="px-3 py-1 rounded-md bg-green-100 text-green-700 text-sm"
                >
                  Complete
                </button>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="px-3 py-1 rounded-md bg-red-100 text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskList;
