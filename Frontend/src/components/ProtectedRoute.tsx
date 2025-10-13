import React from 'react';
import { Navigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const [checking, setChecking] = React.useState(true);
  const [ok, setOk] = React.useState<boolean>(apiClient.isAuthenticated());

  React.useEffect(() => {
    let mounted = true;
    const verify = async () => {
      try {
        if (!apiClient.isAuthenticated()) {
          // try refresh-token flow; verify-token requires valid access
          await apiClient.verifyToken();
        }
        if (mounted) setOk(true);
      } catch {
        if (mounted) setOk(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };
    verify();

    const onAuthChange = () => {
      setOk(apiClient.isAuthenticated());
    };
    window.addEventListener('auth:change', onAuthChange);
    return () => {
      mounted = false;
      window.removeEventListener('auth:change', onAuthChange);
    };
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }
  if (!ok) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
