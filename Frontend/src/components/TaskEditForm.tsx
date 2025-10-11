import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateTask } from '../services/taskService';

interface TaskEditFormProps {
  task: any;
  onTaskUpdated: () => void;
  onCancel: () => void;
}

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  deadline: z.string().optional(),
  status: z.enum([
    'Pending',
    'Assigned',
    'In Progress',
    'Completed',
    'Cancelled',
  ]),
});

type FormData = z.infer<typeof schema>;

const TaskEditForm: React.FC<TaskEditFormProps> = ({
  task,
  onTaskUpdated,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task.title,
      description: task.description,
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
      status: (task.status as FormData['status']) || 'open',
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log('TaskEditForm submit:', data);
    await updateTask(task._id, data);
    console.log('Task updated for id:', task._id);
    onTaskUpdated();
    onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 rounded-lg shadow-sm"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Edit Task</h3>

      <div className="mb-4">
        <label className="form-label">Title</label>
        <input className="form-input" {...register('title')} />
        {errors.title?.message && (
          <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" {...register('description')} />
        {errors.description?.message && (
          <p className="text-sm text-red-500 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="form-label">Deadline</label>
          <input type="date" className="form-input" {...register('deadline')} />
        </div>

        <div>
          <label className="form-label">Status</label>
          <select className="form-select" {...register('status')}>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-sky-600 text-white rounded-md"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TaskEditForm;
