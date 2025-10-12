import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';

interface NavbarProps {
  isAuthenticated?: boolean;
  user?: any;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, user }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const authed = isAuthenticated ?? apiClient.isAuthenticated();
  const currentUser = user ?? apiClient.getUser();

  const handleLogout = () => {
    apiClient.logout();
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-lg font-semibold text-gray-900">
          SkillExchange
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/"
            className={`text-sm font-medium ${
              location.pathname === '/'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`text-sm font-medium ${
              location.pathname.startsWith('/dashboard')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/stack"
            className={`text-sm font-medium ${
              location.pathname === '/stack'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Stack
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        {!authed && (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
          >
            Login
          </button>
        )}
        {authed && currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu((p) => !p)}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-800">
                {currentUser.name}
              </span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/dashboard');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => setIsMenuOpen((p) => !p)}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100"
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1">
            <div className="w-5 h-0.5 bg-gray-800" />
            <div className="w-5 h-0.5 bg-gray-800" />
            <div className="w-5 h-0.5 bg-gray-800" />
          </div>
        </button>
        {isMenuOpen && (
          <div className="absolute top-14 right-0 w-48 bg-white border border-gray-200 rounded-md shadow-md md:hidden">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </Link>
            {!authed && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogin();
                }}
                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
              >
                Login
              </button>
            )}
            {authed && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
