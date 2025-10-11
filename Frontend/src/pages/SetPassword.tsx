import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../services/apiClient';

interface VerifUser {
  email: string;
  name: string;
  rollNo?: string;
  phone?: string;
}

const SetPassword: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [user, setUser] = useState<VerifUser | null>(null);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [techError, setTechError] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const policyChecks = [
    { label: 'At least 6 characters', valid: password.length >= 6 },
    { label: 'Contains a letter', valid: /[A-Za-z]/.test(password) },
    { label: 'Contains a number', valid: /\d/.test(password) },
  ];

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setError('Missing or invalid link.');
        setVerifying(false);
        return;
      }
      try {
        console.log('[SET-PASSWORD] Verifying token...');
        const data = await apiClient.verifyRegisterToken(token);
        console.log('[SET-PASSWORD] Verification response:', data);
        if (data?.user?.email && data?.user?.name) {
          setUser({
            email: data.user.email,
            name: data.user.name,
            rollNo: data.user.rollNo,
          });
          setTokenValid(true);
        } else {
          setError('Token verification returned incomplete user data.');
        }
      } catch (e: any) {
        console.error('[SET-PASSWORD] Verification error:', e);
        setError(e.message || 'Invalid or expired link.');
        setTechError(e.raw || e);
      } finally {
        setVerifying(false);
      }
    };
    run();
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTechError(null);

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!policyChecks.every((p) => p.valid)) {
      setError('Password does not meet requirements.');
      return;
    }

    setSubmitting(true);
    try {
      console.log('[SET-PASSWORD] Creating password...');
      const res = await apiClient.createPassword(
        { password, confirmPassword: confirm },
        token
      );
      console.log('[SET-PASSWORD] Create password response:', res);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (e: any) {
      console.error('[SET-PASSWORD] Create password error:', e);
      setError(e.message || 'Failed to set password.');
      setTechError(e.raw || e);
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Verifying link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid && !success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="absolute top-6 left-6">
          <h1 className="text-xl font-bold text-gray-900">Skill Exchange</h1>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid or Expired Link
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>

          <div className="space-y-3">
            <Link
              to="/signup"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Start Over
            </Link>
            <Link
              to="/login"
              className="block w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="absolute top-6 left-6">
          <h1 className="text-xl font-bold text-gray-900">Skill Exchange</h1>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Password Set!
          </h2>
          <p className="text-gray-600 mb-6">
            Your account has been created successfully. Redirecting to login...
          </p>

          <Link
            to="/login"
            className="inline-block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <h1 className="text-xl font-bold text-gray-900">Skill Exchange</h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Set Your Password
          </h2>
          <p className="text-sm text-gray-600">
            {user ? (
              <>
                Hi <span className="font-semibold">{user.name}</span>, finish
                setting up your account
              </>
            ) : (
              'Complete account setup'
            )}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
            {techError && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium">
                  Technical details
                </summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded border border-red-200 overflow-auto">
                  {JSON.stringify(techError, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Enter password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPwd ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              Password Requirements
            </p>
            <div className="space-y-2">
              {policyChecks.map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      c.valid ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    {c.valid && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-xs ${c.valid ? 'text-gray-900' : 'text-gray-500'}`}
                  >
                    {c.label}
                  </span>
                </div>
              ))}
              {confirm.length > 0 && (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      confirm === password && password.length > 0
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    {confirm === password && password.length > 0 && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      confirm === password && password.length > 0
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    Passwords match
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
