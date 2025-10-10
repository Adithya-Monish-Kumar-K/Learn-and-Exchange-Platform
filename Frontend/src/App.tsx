import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserProfileFormClass from './components/forms/UserProfileForm';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './components/Dashboard';
import Layout from './pages/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SetPassword from './pages/SetPassword';
import { ThemeProvider } from './contexts/ThemeContext';
import About from './pages/About';
import FeaturesPage from './pages/Features';
import ContactPage from './pages/Contact';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<UserProfileFormClass />} />
            <Route
              path="chat"
              element={
                <div className="max-w-4xl mx-auto px-6 py-12">
                  <h1
                    className="text-2xl font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Chat (Coming Soon)
                  </h1>
                  <p
                    style={{ color: 'var(--text-secondary)' }}
                    className="text-sm"
                  >
                    Realtime messaging module under construction.
                  </p>
                </div>
              }
            />
          </Route>
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
