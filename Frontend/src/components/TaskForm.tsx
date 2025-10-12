import React from 'react';
import { useForm } from 'react-hook-form';
import { createTask } from '../services/taskService';

interface TaskFormData {
  title: string;
  description: string;
  deadline: string;
  requirements?: string[];
  attachments?: string[];
  offer?: string[];
}

const TaskForm: React.FC<{
  onTaskCreated: () => void;
  userId: string; // Add userId prop
  onCancel?: () => void;
}> = ({ onTaskCreated, userId, onCancel }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>();

  const onSubmit = async (data: TaskFormData) => {
    try {
      const taskData = {
        ...data,
        postedBy: userId, // Add the user ID
        status: 'Pending', // Set initial status
        requirements: [], // Initialize empty arrays for optional fields
        attachments: [],
        offer: [],
      };
      await createTask(taskData);
      reset();
      onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-8 p-6 rounded-lg shadow-sm"
      style={{
        background: 'var(--card-background)',
        border: '1px solid var(--card-border)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Create New Task
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 rounded-md text-sm"
            style={{
              border: '1px solid var(--card-border)',
              color: 'var(--text-primary)',
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <div className="mb-4">
        <label className="form-label">Title</label>
        <input
          className="form-input"
          {...register('title', {
            required: 'Title is required',
            minLength: 5,
          })}
        />
        {errors.title && <p className="form-error">{errors.title.message}</p>}
      </div>

      <div className="mb-4">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          rows={4}
          {...register('description', { required: 'Description is required' })}
        />
        {errors.description && (
          <p className="form-error">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="form-label">Deadline</label>
          <input
            type="date"
            className="form-input"
            {...register('deadline', { required: 'Deadline required' })}
          />
          {errors.deadline && (
            <p className="form-error">{errors.deadline.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 rounded-md"
          style={{ background: 'var(--info)', color: '#fff' }}
        >
          Create Task
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
