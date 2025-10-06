import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import Navbar from '../components/Navbar';

const ResetPassword: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setErr('Passwords do not match');
      return;
    }
    setErr('');
    setLoading(true);
    try {
      await apiClient.resetPassword(token || '', { password: form.password });
      setOk(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto mt-14 bg-white border border-gray-200 p-8 rounded-lg">
        <h1 className="text-xl font-semibold mb-6 text-gray-900">
          Reset Password
        </h1>
        {err && <div className="mb-4 text-sm text-red-600">{err}</div>}
        {ok && (
          <div className="mb-4 text-sm text-green-600">
            Password updated. Redirecting…
          </div>
        )}
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={onChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              name="confirm"
              type="password"
              required
              minLength={6}
              value={form.confirm}
              onChange={onChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
          <div className="text-sm">
            <Link to="/login" className="text-gray-600 hover:underline">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
