import React, { useEffect, useState } from 'react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Star, MessageSquare } from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

const ReviewDashboard: React.FC = () => {
  const [ratingData, setRatingData] = useState<any[]>([]);
  const [ticketData, setTicketData] = useState<any[]>([]);
  const [userRatings, setUserRatings] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [ratingRes, ticketRes, userRes, trendRes, activityRes, statsRes] = await Promise.all([
          fetch('/api/dashboard/ratings'),
          fetch('/api/dashboard/tickets'),
          fetch('/api/dashboard/users'),
          fetch('/api/dashboard/trend'),
          fetch('/api/dashboard/activity'),
          fetch('/api/dashboard/stats'),
        ]);
        // Use mock data if fetch fails or returns empty
  const ratingJson = ratingRes.ok ? await ratingRes.json() : [];
  setRatingData(ratingJson);

  const ticketJson = ticketRes.ok ? await ticketRes.json() : [];
  setTicketData(ticketJson);

  const userJson = userRes.ok ? await userRes.json() : [];
  setUserRatings(userJson);

  const trendJson = trendRes.ok ? await trendRes.json() : [];
  setTrendData(trendJson);

  const activityJson = activityRes.ok ? await activityRes.json() : [];
  setActivity(activityJson);

  const statsJson = statsRes.ok ? await statsRes.json() : {};
  setStats(statsJson);
      } catch (err: any) {
        setError(err.message || 'Error loading dashboard');
        // Use mock data on error
  // If fetch fails, leave data arrays empty
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Reviews & Support System Insights</p>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading && <div className="text-gray-500 mb-4">Loading dashboard...</div>}

        {/* Stats Grid (for object) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(stats).map(([key, value], index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">{key}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{String(value)}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Rating Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ratingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.rating}⭐ (${entry.count})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {ratingData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Ticket Resolution Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Tickets</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="resolved" stackId="a" fill="#22c55e" name="Resolved" />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Ratings Table and Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Rated Users */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Rated Users</h3>
            <div className="space-y-4">
              {userRatings.map((user: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.totalReviews} reviews</p>
                  </div>
                  <div className="flex items-center">
                    <Star size={16} className="text-yellow-400 mr-1" />
                    <span className="font-semibold text-gray-900">{user.averageRating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Trend */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Trend Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[3.8, 4.6]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activity.map((act: any, index: number) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-full ${
                  act.type === 'review' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  {act.type === 'review' ? (
                    <Star size={16} className="text-yellow-600" />
                  ) : (
                    <MessageSquare size={16} className="text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{act.user}</span> {act.action}
                  </p>
                  <p className="text-xs text-gray-500">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDashboard;
