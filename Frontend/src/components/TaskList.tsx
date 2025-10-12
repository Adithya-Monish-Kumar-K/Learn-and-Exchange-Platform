import React, { useEffect, useState } from 'react';
import { getTasks } from '../services/taskService';
import TaskForm from './TaskForm';
import TaskEditForm from './TaskEditForm';

const TaskList: React.FC = () => {
  const userStr = localStorage.getItem('user');
  const parsedUser = (() => {
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  })();

  type TaskStatus =
    | 'Pending'
    | 'Assigned'
    | 'In Progress'
    | 'Completed'
    | 'Cancelled';
  interface TaskItem {
    _id: string;
    title: string;
    description: string;
    status?: TaskStatus;
    deadline?: string;
  }
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadTasks = async () => {
    const data = await getTasks();
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const downloadJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadAllTasks = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      count: tasks.length,
      tasks: tasks.map((t) => ({
        _id: t._id,
        title: t.title,
        description: t.description,
        status: t.status ?? 'Pending',
        deadline: t.deadline ?? null,
      })),
    };
    downloadJson(payload, `tasks-${Date.now()}.json`);
  };

  const downloadSingleTask = (task: TaskItem) => {
    const payload = {
      exportedAt: new Date().toISOString(),
      task,
    };
    const safeName =
      task.title?.toString().trim().replace(/\s+/g, '_').slice(0, 32) || 'task';
    downloadJson(payload, `${safeName}-${task._id}.json`);
  };

  return (
    <div
      className="p-6 min-h-screen"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Task Manager
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadAllTasks}
              className="px-4 py-2 rounded-md"
              style={{
                border: '1px solid var(--card-border)',
                color: 'var(--text-primary)',
              }}
              title="Download all tasks as JSON"
            >
              Download Tasks
            </button>
            {!editingTask && (
              <button
                onClick={() => setShowCreateForm((v) => !v)}
                className="px-4 py-2 rounded-md"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                {showCreateForm ? 'Close' : 'Create Task'}
              </button>
            )}
          </div>
        </div>

        {!editingTask && showCreateForm && (
          <TaskForm
            onTaskCreated={() => {
              loadTasks();
              setShowCreateForm(false);
            }}
            onCancel={() => setShowCreateForm(false)}
            userId={parsedUser?.id || parsedUser?._id || ''}
          />
        )}
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

        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          All Tasks
        </h2>
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between"
              style={{
                background: 'var(--card-background)',
                border: '1px solid var(--card-border)',
              }}
            >
              <div>
                <div className="flex items-center gap-3">
                  <div
                    className="text-lg font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {task.title}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {task.status}
                  </div>
                </div>
                <div
                  className="text-sm mt-2 italic"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {task.description}
                </div>
                <div
                  className="text-xs mt-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Deadline:{' '}
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>

              <div className="mt-4 sm:mt-0 flex gap-2">
                <button
                  onClick={() => setEditingTask(task)}
                  className="px-3 py-1 rounded-md text-sm"
                  style={{
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => downloadSingleTask(task)}
                  className="px-3 py-1 rounded-md text-sm"
                  style={{
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                  title="Download this task"
                >
                  Download
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
