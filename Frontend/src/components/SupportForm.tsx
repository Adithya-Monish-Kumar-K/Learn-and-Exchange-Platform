import React, { useState } from 'react';
import axios from 'axios';
import apiClient from '../services/apiClient';

const SupportForm: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const currentUserId = apiClient.getUser()?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Backend expects: requestType, request, requestBy (string IDs)
      const payload = {
        requestType: subject.trim(),
        request: description.trim(),
        requestBy: currentUserId || 'anonymous',
      };
      await axios.post(
        'https://skill-exchange-platform-9s6c.onrender.com/api/tickets',
        payload
      );
      setSuccess(true);
      setSubject('');
      setDescription('');
      // Notify listeners to refresh tickets list
      window.dispatchEvent(new CustomEvent('support:tickets:refresh'));
    } catch (err: any) {
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Submit a Support Ticket</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Request Type</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Access Issue, Bug Report, Billing, General"
          required
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Request Details
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please provide detailed information about your request..."
          required
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px] resize-y dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </button>

        {success && (
          <div className="text-green-600 dark:text-green-400 animate-fade-in">
            Ticket submitted successfully!
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-lg dark:bg-red-900 dark:border-red-800 dark:text-red-200">
          {error}
        </div>
      )}
    </form>
  );
};

export default SupportForm;
