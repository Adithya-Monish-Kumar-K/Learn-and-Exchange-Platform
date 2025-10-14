import { Component } from 'react';
import type React from 'react';
import { createTask } from '../services/taskService';

interface TaskFormData {
  title: string;
  description: string;
  deadline: string;
  requirements?: string[];
  attachments?: string[];
  offer?: string[];
}

type TaskFormProps = {
  onTaskCreated: () => void;
  userId: string;
  onCancel?: () => void;
};

type TaskFormErrors = Partial<Record<keyof TaskFormData, string>>;

interface TaskFormState {
  form: TaskFormData;
  errors: TaskFormErrors;
  submitting: boolean;
}

class TaskForm extends Component<TaskFormProps, TaskFormState> {
  state: TaskFormState = {
    form: {
      title: '',
      description: '',
      deadline: '',
      requirements: [],
      attachments: [],
      offer: [],
    },
    errors: {},
    submitting: false,
  };

  validate = (): TaskFormErrors => {
    const { form } = this.state;
    const errors: TaskFormErrors = {};
    if (!form.title?.trim()) {
      errors.title = 'Title is required';
    } else if (form.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters';
    }
    if (!form.description?.trim()) {
      errors.description = 'Description is required';
    }
    if (!form.deadline) {
      errors.deadline = 'Deadline required';
    }
    return errors;
  };

  handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      form: { ...prev.form, [name]: value } as TaskFormData,
      errors: { ...prev.errors, [name]: undefined },
    }));
  };

  handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = this.validate();
    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }

    try {
      this.setState({ submitting: true });
      const { form } = this.state;
      const { userId, onTaskCreated } = this.props;

      const taskData = {
        ...form,
        postedBy: userId,
        status: 'Pending',
        requirements: form.requirements ?? [],
        attachments: form.attachments ?? [],
        offer: form.offer ?? [],
      } as any;

      await createTask(taskData);

      // Reset form
      this.setState({
        form: {
          title: '',
          description: '',
          deadline: '',
          requirements: [],
          attachments: [],
          offer: [],
        },
        errors: {},
        submitting: false,
      });

      onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
      this.setState({ submitting: false });
    }
  };

  render() {
    const { onCancel } = this.props;
    const { form, errors, submitting } = this.state;

    return (
      <form
        onSubmit={this.handleSubmit}
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
            name="title"
            value={form.title}
            onChange={this.handleChange}
            className="form-input"
          />
          {errors.title && <p className="form-error">{errors.title}</p>}
        </div>

        <div className="mb-4">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={this.handleChange}
            className="form-textarea"
            rows={4}
          />
          {errors.description && (
            <p className="form-error">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={this.handleChange}
              className="form-input"
            />
            {errors.deadline && <p className="form-error">{errors.deadline}</p>}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-md disabled:opacity-60"
            style={{ background: 'var(--info)', color: '#fff' }}
          >
            {submitting ? 'Creating…' : 'Create Task'}
          </button>
        </div>
      </form>
    );
  }
}

export default TaskForm;
