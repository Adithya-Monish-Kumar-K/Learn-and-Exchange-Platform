import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Send } from 'lucide-react';
import { IOffer, ITask } from '../../types';
import { offersAPI, tasksAPI } from '../../services/api';

const CreateOfferForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [formData, setFormData] = useState<Omit<IOffer, '_id' | 'createdAt' | 'updatedAt'>>({
    task: '',
    offeredBy: 'current-user-id', // In real app, get from auth context
    description: '',
    valueType: 'service',
    valueDetail: '',
    assets: [],
    status: 'pending'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      if (response.data && response.data.data) {
        setTasks(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      
      // Fallback to mock data if backend is not available
      const mockTasks: ITask[] = [
        { _id: '1', title: 'Website Development', description: 'Build a responsive website', category: 'Development', createdBy: 'user1' },
        { _id: '2', title: 'Logo Design', description: 'Design company logo', category: 'Design', createdBy: 'user2' },
        { _id: '3', title: 'Content Writing', description: 'Write blog posts', category: 'Writing', createdBy: 'user3' }
      ];
      setTasks(mockTasks);
      toast.error('Backend not available - using demo tasks');
    }
  };

  const validateForm = (): boolean => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const response = await offersAPI.create(formData);
      toast.success(response.data.message || 'Offer created successfully!');
      navigate('/offers');
    } catch (error) {
      console.error('Error creating offer:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create offer. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Offer</h1>
            <p className="text-gray-600 mt-2">Share your skills, services, or assets with the community.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-2">
                Task *
              </label>
              <select
                id="task"
                name="task"
                value={formData.task}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.task ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a task</option>
                {tasks.map(task => (
                  <option key={task._id} value={task._id}>
                    {task.title} - {task.category}
                  </option>
                ))}
              </select>
              {errors.task && <p className="text-red-500 text-xs mt-1">{errors.task}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what you're offering in detail..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between mt-1">
                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                <p className="text-gray-400 text-xs">{formData.description.length}/500</p>
              </div>
            </div>

            <div>
              <label htmlFor="valueType" className="block text-sm font-medium text-gray-700 mb-2">
                Value Type *
              </label>
              <select
                id="valueType"
                name="valueType"
                value={formData.valueType}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.valueType ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="service">Service</option>
                <option value="skill">Skill</option>
                <option value="asset">Asset</option>
                <option value="other">Other</option>
              </select>
              {errors.valueType && <p className="text-red-500 text-xs mt-1">{errors.valueType}</p>}
            </div>

            <div>
              <label htmlFor="valueDetail" className="block text-sm font-medium text-gray-700 mb-2">
                Value Detail
              </label>
              <input
                type="text"
                id="valueDetail"
                name="valueDetail"
                value={formData.valueDetail}
                onChange={handleInputChange}
                placeholder="e.g., $50/hour, 2 hours of consultation, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="assets" className="block text-sm font-medium text-gray-700 mb-2">
                Assets (Optional)
              </label>
              <input
                type="text"
                id="assets"
                name="assets"
                value={formData.assets?.join(', ') || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  assets: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                }))}
                placeholder="List any relevant files, links, or resources (comma-separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Create Offer</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/offers')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOfferForm;