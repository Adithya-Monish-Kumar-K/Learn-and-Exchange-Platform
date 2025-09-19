import React from 'react';
import { Formik, Form, Field } from 'formik';
import { z } from 'zod';

type Option = { _id: string; label: string };
type Props = {
  users: Option[];
  tasks: Option[];
  onClose: () => void;
  onSubmit: (values: any) => void;
};

const Schema = z.object({
  user: z.string().min(1, 'Select a user'),
  task: z.string().optional(),
  title: z.string().min(1, 'Title required'),
  description: z.string().min(1, 'Description required'),
});

export default class RequestForm extends React.Component<Props> {
  validate = (values: any) => {
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

  render() {
    const { users, tasks, onClose, onSubmit } = this.props;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-0">
        <div className="w-full max-w-2xl sm:rounded-lg bg-white shadow-lg overflow-auto h-full sm:h-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold text-sky-600">
              Request to Chat
            </h3>
            <button className="text-gray-600" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="p-6">
            <Formik
              initialValues={{ user: '', task: '', title: '', description: '' }}
              validate={this.validate}
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
                      <label className="text-sm text-gray-700">User</label>
                      <Field
                        as="select"
                        name="user"
                        className="w-full mt-1 p-2 border rounded-md"
                      >
                        <option value="">Select user</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.label}
                          </option>
                        ))}
                      </Field>
                      {errors.user && (
                        <div className="text-red-500 text-sm mt-1">
                          {(errors as any).user}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-700">
                        Task (optional)
                      </label>
                      <Field
                        as="select"
                        name="task"
                        className="w-full mt-1 p-2 border rounded-md"
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
                      <label className="text-sm text-gray-700">Title</label>
                      <Field
                        name="title"
                        className="w-full mt-1 p-2 border rounded-md"
                      />
                      {errors.title && (
                        <div className="text-red-500 text-sm mt-1">
                          {(errors as any).title}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-700">
                        Description
                      </label>
                      <Field
                        as="textarea"
                        name="description"
                        rows={4}
                        className="w-full mt-1 p-2 border rounded-md"
                      />
                      {errors.description && (
                        <div className="text-red-500 text-sm mt-1">
                          {(errors as any).description}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-md border"
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-md bg-sky-600 text-white"
                      >
                        Send
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
  }
}
