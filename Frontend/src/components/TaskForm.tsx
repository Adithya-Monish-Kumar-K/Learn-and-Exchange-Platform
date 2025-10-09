import React from 'react';
import { useForm } from 'react-hook-form';
import { createTask } from '../services/taskService';

interface TaskFormData {
  title: string;
  description: string;
  postedBy: string;
  deadline: string;
}

const TaskForm: React.FC<{ onTaskCreated: () => void }> = ({
  onTaskCreated,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>();

  const onSubmit = async (data: TaskFormData) => {
    await createTask(data);
    reset();
    onTaskCreated(); // reload tasks in parent
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-8 bg-white p-6 rounded-lg shadow-sm"
    >
      <h3 className="text-xl font-semibold mb-4 text-sky-700">
        Create New Task
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
          {...register('title', {
            required: 'Title is required',
            minLength: 5,
          })}
        />
        {errors.title && (
          <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
          rows={4}
          {...register('description', { required: 'Description is required' })}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Posted By (User ID)
          </label>
          <input
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
            {...register('postedBy', { required: 'User ID required' })}
          />
          {errors.postedBy && (
            <p className="text-sm text-red-500 mt-1">
              {errors.postedBy.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deadline
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
            {...register('deadline', { required: 'Deadline required' })}
          />
          {errors.deadline && (
            <p className="text-sm text-red-500 mt-1">
              {errors.deadline.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
        >
          Create Task
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
