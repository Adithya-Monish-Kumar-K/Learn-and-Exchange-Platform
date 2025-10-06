import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import apiClient from '../services/apiClient';
import {
  MessageCircle,
  Users,
  Briefcase,
  Settings,
  LogOut,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(apiClient.getUser());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'settings'>(
    'overview'
  );

  useEffect(() => {
    const init = async () => {
      if (!apiClient.isAuthenticated()) {
        navigate('/login');
        return;
      }
      if (!user) {
        try {
          const data = await apiClient.verifyToken();
          apiClient.setUser(data.user);
          setUser(data.user);
        } catch {
          apiClient.logout();
          navigate('/login');
          return;
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const logout = () => {
    apiClient.logout();
    navigate('/login');
  };

  const goChat = () => navigate('/user/chat');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar isAuthenticated />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated user={user} />
      <div className="flex h-[calc(100vh-4rem)]">
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    activeTab === 'overview'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                  Overview
                </button>
              </li>
              <li>
                <button
                  onClick={goChat}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    activeTab === 'tasks'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                  Tasks
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
              </li>
            </ul>
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </button>
          </div>
        </aside>
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                Welcome back, {user?.name}
              </h1>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-8">
                <div className="bg-white p-5 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        Active Chats
                      </p>
                      <p className="text-2xl font-semibold">0</p>
                    </div>
                    <MessageCircle className="w-7 h-7 text-blue-600" />
                  </div>
                </div>
                <div className="bg-white p-5 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        Tasks Created
                      </p>
                      <p className="text-2xl font-semibold">0</p>
                    </div>
                    <Briefcase className="w-7 h-7 text-green-600" />
                  </div>
                </div>
                <div className="bg-white p-5 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        Connections
                      </p>
                      <p className="text-2xl font-semibold">0</p>
                    </div>
                    <Users className="w-7 h-7 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={goChat}
                    className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    Start a Chat
                  </button>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Briefcase className="w-5 h-5 text-green-600" />
                    Create Task
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'tasks' && (
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-4">
                Your Tasks
              </h1>
              <p className="text-gray-600 text-sm">You have no tasks yet.</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-4">
                Settings
              </h1>
              <p className="text-gray-600 text-sm">Settings coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
