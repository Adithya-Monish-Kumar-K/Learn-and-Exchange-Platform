import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserProfileFormClass from './components/forms/UserProfileForm';
import Chat, { type User } from './components/Chat';
import ReviewForm from './components/ReviewForm';
import ReviewsList from './components/ReviewsList';
import SupportForm from './components/SupportForm';
import SupportTickets from './components/SupportTickets';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './components/Dashboard';
import Layout from './pages/Layout';
import TaskList from './components/TaskList';
import ProtectedRoute from './components/ProtectedRoute';
import SetPassword from './pages/SetPassword';
import { ThemeProvider } from './contexts/ThemeContext';
import apiClient from './services/apiClient';
import About from './pages/About';
import FeaturesPage from './pages/Features';
import ContactPage from './pages/Contact';
import Offers from './pages/offers';
import CreateOfferForm from './components/offers/CreateOfferForm';
import UpdateOfferForm from './components/offers/UpdateOfferForm';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfileFormClass />} />

            {/* Chat Routes */}
            <Route
              path="/chat"
              element={
                <div className="h-[calc(100vh-4rem)]">
                  {apiClient.getUser() ? (
                    <Chat currentUser={apiClient.getUser() as User} />
                  ) : (
                    <div>User not found. Please log in.</div>
                  )}
                </div>
              }
            />

            {/* Offers Routes */}
            <Route path="/offers" element={<Offers />} />
            <Route path="/offers/create" element={<CreateOfferForm />} />
            <Route path="/offers/edit/:id" element={<UpdateOfferForm />} />

            {/* Tasks Routes */}
            <Route path="/tasks" element={<TaskList />} />

            {/* Reviews Routes */}
            <Route
              path="/reviews"
              element={
                <div className="p-4">
                  <ReviewForm />
                  <ReviewsList />
                </div>
              }
            />

            {/* Support Routes */}
            <Route
              path="/support"
              element={
                <div className="p-4">
                  <SupportForm />
                  <SupportTickets />
                </div>
              }
            />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
