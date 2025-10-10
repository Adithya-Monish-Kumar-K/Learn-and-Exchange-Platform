import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageCircle,
  CheckSquare,
  Settings,
  Home,
  Users,
  BarChart3,
  LogOut,
  Sun,
  Moon,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type NavItem = {
  id: string;
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  divider?: boolean;
};

type User = {
  _id: string;
  fullName: string;
  profilePic?: string;
  status?: 'online' | 'offline' | 'away';
};

export default function ModernSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const navItems: NavItem[] = [
    { id: 'overview', path: '/user/dashboard', label: 'Overview', icon: Home },
    {
      id: 'chat',
      path: '/user/chat',
      label: 'Chat',
      icon: MessageCircle,
      badge: 3,
    },
    {
      id: 'tasks',
      path: '/user/tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: 5,
    },
    {
      id: 'analytics',
      path: '/user/analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'team',
      path: '/user/team',
      label: 'Team',
      icon: Users,
      divider: true,
    },
    {
      id: 'notifications',
      path: '/user/profile',
      label: 'Profile',
      icon: User,
      badge: 2,
    },
    {
      id: 'settings',
      path: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
      divider: true,
    },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <aside
      style={{
        background: 'var(--sidebar)',
        borderRight: '1px solid var(--sidebar-border)',
        color: 'var(--sidebar-foreground)',
      }}
      className={`${
        isCollapsed ? 'w-20' : 'w-80'
      } fixed top-0 left-0 h-screen flex flex-col shadow-lg transition-all duration-300`}
    >
      {/* Header */}
      <div
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        className="p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg text-white flex-shrink-0">
            SE
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <h1
                style={{ color: 'var(--text-primary)' }}
                className="font-bold text-lg"
              >
                Skill Exchange
              </h1>
              <p style={{ color: 'var(--text-secondary)' }} className="text-xs">
                Welcome back
              </p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-slate-500 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="overflow-y-auto p-4 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id}>
              <button
                onClick={() => handleNavClick(item.path)}
                style={{
                  background:
                    location.pathname === item.path
                      ? 'var(--info)'
                      : 'transparent',
                  color:
                    location.pathname === item.path
                      ? 'white'
                      : 'var(--text-secondary)',
                }}
                className={`w-full flex items-center gap-3 px-3 py-4 rounded-lg transition-all duration-200 group relative hover:bg-opacity-10 hover:bg-slate-500 cursor-pointer`}
              >
                <span
                  className={`transition-transform ${
                    location.pathname === item.path ? 'scale-110' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                {!isCollapsed && (
                  <span className="font-medium text-sm flex-1 text-left">
                    {item.label}
                  </span>
                )}
              </button>
              {item.divider && (
                <div
                  style={{ background: 'var(--sidebar-border)' }}
                  className="my-2 h-px"
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{ borderTop: '1px solid var(--sidebar-border)' }}
        className="p-4 space-y-2 mt-auto"
      >
        <button
          onClick={toggleTheme}
          style={{ color: 'var(--text-secondary)' }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group hover:bg-opacity-10 hover:bg-slate-500"
        >
          {isDark ? (
            <Sun className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
          ) : (
            <Moon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
          )}
          {!isCollapsed && (
            <span className="font-medium text-sm">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>
        <button
          style={{ color: 'var(--text-secondary)' }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group hover:bg-opacity-10 hover:bg-slate-500"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
