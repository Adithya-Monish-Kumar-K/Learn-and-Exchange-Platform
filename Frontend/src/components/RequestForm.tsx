import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { z } from 'zod';
import apiClient from '../services/apiClient';

type Option = { _id: string; label: string };
type Props = {
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: {
    user: string;
    task?: string;
    title: string;
    description: string;
  };
  isEditing?: boolean;
};

const Schema = z.object({
  user: z.string().min(1, 'Select a user'),
  task: z.string().optional(),
  title: z.string().min(1, 'Title required'),
  description: z.string().min(1, 'Description required'),
});

const RequestForm: React.FC<Props> = ({
  onClose,
  onSubmit,
  initialValues,
  isEditing,
}) => {
  const [users, setUsers] = useState<Option[]>([]);
  const [tasks, setTasks] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, tasksData] = await Promise.all([
          apiClient.getAllUsers(),
          apiClient.getAllTasks(),
        ]);

        setUsers(
          usersData.map((user: any) => ({
            _id: user._id,
            label: user.name,
          }))
        );

        setTasks(
          tasksData.map((task: any) => ({
            _id: task._id,
            label: task.title,
          }))
        );
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const validate = (values: any) => {
    const result = Schema.safeParse(values);
    if (result.success) return {};
    const fieldErrors = result.error.flatten().fieldErrors;
    const errors: Record<string, string> = {};
    Object.keys(fieldErrors).forEach((k) => {
      const v = (fieldErrors as any)[k];
      if (v && v.length) errors[k] = v[0];
    });
    return errors;
  };

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'var(--overlay-background)' }}
      >
        <div className="text-lg" style={{ color: 'var(--text-primary)' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--overlay-background)' }}
    >
      <div
        className="w-full max-w-2xl sm:rounded-lg overflow-auto h-full sm:h-auto"
        style={{
          background: 'var(--card-background)',
          borderColor: 'var(--card-border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <h3
            className="text-lg font-semibold"
            style={{ color: 'var(--primary)' }}
          >
            {isEditing ? 'Edit Request' : 'Request to Chat'}
          </h3>
          <button style={{ color: 'var(--text-secondary)' }} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="p-6">
          <Formik
            initialValues={
              initialValues || {
                user: '',
                task: '',
                title: '',
                description: '',
              }
            }
            validate={validate}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={(values, actions) => {
              console.log('validated values:', values);
              onSubmit(values);
              actions.setSubmitting(false);
              onClose();
            }}
          >
            {({ isSubmitting, errors }) => (
              <Form>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="form-label">
                      User
                    </label>
                    <Field
                      as="select"
                      name="user"
                      className="form-select"
                    >
                      <option value="">Select user</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.label}
                        </option>
                      ))}
                    </Field>
                    {errors.user && (
                      <div
                        className="text-sm mt-1"
                        style={{ color: 'var(--error)' }}
                      >
                        {(errors as any).user}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="form-label">
                      Task (optional)
                    </label>
                    <Field
                      as="select"
                      name="task"
                      className="form-select"
                    >
                      <option value="">None</option>
                      {tasks.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.label}
                        </option>
                      ))}
                    </Field>
                  </div>

                  <div>
                    <label className="form-label">
                      Title
                    </label>
                    <Field
                      name="title"
                      className="form-input"
                    />
                    {errors.title && (
                      <div className="form-error">
                        {(errors as any).title}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="form-label">
                      Description
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows={4}
                      className="form-textarea"
                    />
                    {errors.description && (
                      <div className="form-error">
                        {(errors as any).description}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md"
                      style={{
                        backgroundColor: 'var(--button-secondary-background)',
                        color: 'var(--button-secondary-text)',
                        borderColor: 'var(--button-secondary-border)',
                      }}
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-md"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--primary-text)',
                        opacity: isSubmitting ? 0.7 : 1,
                      }}
                    >
                      {isEditing ? 'Update' : 'Send'}
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;
