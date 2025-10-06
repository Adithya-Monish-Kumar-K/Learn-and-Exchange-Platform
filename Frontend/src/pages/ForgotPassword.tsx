import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import Navbar from '../components/Navbar';

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto mt-14 bg-white border border-gray-200 p-8 rounded-lg">
        <h1 className="text-xl font-semibold mb-6 text-gray-900">
          Forgot Password
        </h1>
        {err && <div className="mb-4 text-sm text-red-600">{err}</div>}
        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-green-700">
              If an account exists for {email}, a reset link has been sent.
            </p>
            <Link to="/login" className="text-blue-600 text-sm hover:underline">
              Return to login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="you@example.com"
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="text-sm">
              <Link to="/login" className="text-gray-600 hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
