import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import SetPassword from './pages/SetPassword';

function App() {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/chat"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navbar isAuthenticated />
                  <div className="max-w-4xl mx-auto px-6 py-12">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                      Chat (Coming Soon)
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Realtime messaging module under construction.
                    </p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </>
    </Router>
  );
}

export default App;
