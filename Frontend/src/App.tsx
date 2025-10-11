import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserProfileFormClass from './components/forms/UserProfileForm';
import Chat from './components/Chat';
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
import apiClient from './services/apiClient';
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
                <div className="h-[calc(100vh-4rem)]">
                  <Chat currentUser={apiClient.getUser()} />
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
