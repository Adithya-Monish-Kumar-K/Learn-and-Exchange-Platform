import React, { PureComponent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { NavigateFunction, Params } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Save } from 'lucide-react';
import type { IOffer, IUpdateOfferPayload } from '../../types';
import { getTasks } from '../../services/taskService';
import offerService from '../../services/offerService';

// Define minimal ITask locally for this form
type ITask = {
  _id: string;
  title: string;
  category?: string;
  description?: string;
  createdBy?: string;
};

type RouterProps = {
  navigate: NavigateFunction;
  params: Readonly<Params<string>>;
};

type State = {
  loading: boolean;
  initialLoading: boolean;
  tasks: ITask[];
  formData: IOffer;
  errors: Record<string, string>;
};

class UpdateOfferFormClass extends PureComponent<RouterProps, State> {
  state: State = {
    loading: false,
    initialLoading: true,
    tasks: [],
    formData: {
      task: '',
      offeredBy: '',
      description: '',
      valueType: 'service',
      valueDetail: '',
      assets: [],
      status: 'pending',
    },
    errors: {},
  };

  componentDidMount(): void {
    const id = this.props.params.id;
    if (id) {
      this.fetchOfferAndTasks(id);
    } else {
      this.setState({ initialLoading: false });
    }
  }

  componentDidUpdate(prevProps: RouterProps): void {
    const prevId = prevProps.params.id;
    const id = this.props.params.id;
    if (id && id !== prevId) {
      this.fetchOfferAndTasks(id);
    }
  }

  fetchOfferAndTasks = async (id: string) => {
    try {
      const [fetchedTasks, offer] = await Promise.all([
        getTasks(),
        offerService.getOfferById(id),
      ]);

      this.setState({ tasks: fetchedTasks, formData: offer.data });
    } catch (error) {
      console.error('Error fetching data:', error);

      // Fallback to mock data if backend is not available
      const mockTasks: ITask[] = [
        {
          _id: '1',
          title: 'Website Development',
          description: 'Build a responsive website',
          category: 'Development',
          createdBy: 'user1',
        },
        {
          _id: '2',
          title: 'Logo Design',
          description: 'Design company logo',
          category: 'Design',
          createdBy: 'user2',
        },
        {
          _id: '3',
          title: 'Content Writing',
          description: 'Write blog posts',
          category: 'Writing',
          createdBy: 'user3',
        },
      ];

      const mockOffer: IOffer = {
        _id: id,
        task: '1',
        offeredBy: 'current-user-id',
        description:
          'I can help with frontend development using React and TypeScript. I have 5 years of experience and can deliver high-quality, responsive websites.',
        valueType: 'service',
        valueDetail: '$75/hour',
        assets: ['portfolio-link', 'github-profile'],
        status: 'pending',
      };

      this.setState({ tasks: mockTasks, formData: mockOffer });
      toast.error('Backend not available - using demo data');
    } finally {
      this.setState({ initialLoading: false });
    }
  };

  validateForm = (): boolean => {
    const { formData } = this.state;
    const newErrors: Record<string, string> = {};

    if (!formData.task) {
      newErrors.task = 'Task is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (!formData.valueType) {
      newErrors.valueType = 'Value type is required';
    }

    this.setState({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!this.validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    this.setState({ loading: true });
    try {
      const { formData } = this.state;
      const id = this.props.params.id!;
      const taskId =
        typeof formData.task === 'string'
          ? formData.task
          : formData.task?._id || '';
      const payload: IUpdateOfferPayload = {
        task: taskId,
        description: formData.description,
        valueType: formData.valueType,
        valueDetail: formData.valueDetail,
        assets: formData.assets,
        status: formData.status,
      };
      const response = await offerService.updateOffer(id, payload);
      toast.success(response.message || 'Offer updated successfully!');
      this.props.navigate('/offers');
    } catch (error) {
      console.error('Error updating offer:', error);
      const errorMessage =
        error && typeof error === 'object' && 'message' in (error as any)
          ? String((error as { message?: unknown }).message)
          : 'Failed to update offer. Please try again.';
      toast.error(errorMessage);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value } as IOffer,
      errors: prev.errors[name] ? { ...prev.errors, [name]: '' } : prev.errors,
    }));
  };

  handleAssetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const assets = e.target.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    this.setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, assets },
    }));
  };

  render() {
    const { loading, initialLoading, tasks, formData, errors } = this.state;

    if (initialLoading) {
      return (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: 'var(--background)' }}
        >
          <div className="text-center">
            <div
              className="w-8 h-8 border-4 rounded-full animate-spin mx-auto mb-4"
              style={{
                borderColor: 'var(--info)',
                borderTopColor: 'transparent',
              }}
            ></div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Loading offer data...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="min-h-screen py-8"
        style={{ background: 'var(--background)' }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-xl shadow-sm p-6"
            style={{
              background: 'var(--card-background)',
              border: '1px solid var(--card-border)',
            }}
          >
            <div className="mb-6">
              <h1
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Update Offer
              </h1>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                Modify your offer details below.
              </p>
            </div>

            <form onSubmit={this.handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="task" className="form-label">
                  Task *
                </label>
                <select
                  id="task"
                  name="task"
                  value={
                    typeof formData.task === 'string'
                      ? formData.task
                      : formData.task?._id || ''
                  }
                  onChange={this.handleInputChange}
                  className={`form-select ${errors.task ? 'border-red-300' : ''}`}
                >
                  <option value="">Select a task</option>
                  {tasks.map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.title} - {task.category}
                    </option>
                  ))}
                </select>
                {errors.task && <p className="form-error">{errors.task}</p>}
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={this.handleInputChange}
                  placeholder="Describe what you're offering in detail..."
                  className={`form-textarea ${errors.description ? 'border-red-300' : ''}`}
                />
                <div className="flex justify-between mt-1">
                  {errors.description && (
                    <p className="form-error">{errors.description}</p>
                  )}
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formData.description.length}/500
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="valueType" className="form-label">
                  Value Type *
                </label>
                <select
                  id="valueType"
                  name="valueType"
                  value={formData.valueType}
                  onChange={this.handleInputChange}
                  className={`form-select ${errors.valueType ? 'border-red-300' : ''}`}
                >
                  <option value="service">Service</option>
                  <option value="skill">Skill</option>
                  <option value="asset">Asset</option>
                  <option value="other">Other</option>
                </select>
                {errors.valueType && (
                  <p className="form-error">{errors.valueType}</p>
                )}
              </div>

              <div>
                <label htmlFor="valueDetail" className="form-label">
                  Value Detail
                </label>
                <input
                  type="text"
                  id="valueDetail"
                  name="valueDetail"
                  value={formData.valueDetail || ''}
                  onChange={this.handleInputChange}
                  placeholder="e.g., $50/hour, 2 hours of consultation, etc."
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={this.handleInputChange}
                  className="form-select"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>

              <div>
                <label htmlFor="assets" className="form-label">
                  Assets (Optional)
                </label>
                <input
                  type="text"
                  id="assets"
                  name="assets"
                  value={formData.assets?.join(', ') || ''}
                  onChange={this.handleAssetsChange}
                  placeholder="List any relevant files, links, or resources (comma-separated)"
                  className="form-input"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                  style={{ background: 'var(--info)', color: '#fff' }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update Offer</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => this.props.navigate('/offers')}
                  className="px-6 py-2 rounded-lg transition-colors"
                  style={{
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const UpdateOfferForm: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  return <UpdateOfferFormClass navigate={navigate} params={params} />;
};

export default UpdateOfferForm;
