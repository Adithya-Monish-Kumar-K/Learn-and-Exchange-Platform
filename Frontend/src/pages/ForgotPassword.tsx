import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      await apiClient.forgotPassword({ email });
      setSent(true);
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div className="absolute top-6 left-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Skill Exchange</h1>
      </div>

      <div className="w-full max-w-md rounded-2xl shadow-xl p-8" style={{ background: 'var(--card-background)', border: '1px solid var(--card-border)' }}>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
          <p className="text-sm text-gray-600">
            {sent ? 'Check your email for the reset link' : 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {err && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{err}</p>
          </div>
        )}

        {sent ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">
                If an account exists for <span className="font-semibold">{email}</span>, a reset link has been sent.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Check your spam/junk folder if not found</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Link expires in 1 hour</span>
                </li>
              </ul>
            </div>

            <Link
              to="/login"
              className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                style={{ background: 'var(--card-background)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;