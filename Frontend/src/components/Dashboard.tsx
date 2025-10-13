import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Gift, MessageSquare } from 'lucide-react';
import apiClient from '../services/apiClient';
import StatsCard from './StatsCard';
import ChartCard from './ChartCard';
import TaskStatsChart from './TaskStatsChart';
import { getTaskStats } from '../services/taskService';

interface Stat {
  color: string;
  title: string;
  value: number;
  trend: {
    value: number;
    isPositive: boolean;
  };
}

const iconMap = {
  'Total Users': Users,
  'Tasks Completed': CheckCircle,
  'Active Offers': Gift,
  Reviews: MessageSquare,
};

const colorMap = {
  'Total Users': 'bg-blue-500',
  'Tasks Completed': 'bg-green-500',
  'Active Offers': 'bg-orange-500',
  Reviews: 'bg-purple-500',
};

const Dashboard: React.FC = () => {
  console.log('Dashboard component rendering');
  const [user] = useState<any>(() => {
    const currentUser = apiClient.getUser();
    console.log('Current user:', currentUser);
    return currentUser;
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);
  const [error, setError] = useState('');
  const [taskStats, setTaskStats] = useState<any>(null);
  const [chartData, setChartData] = useState<{
    userTrend?: any;
    reviewDist?: any;
    chatTrend?: any;
  }>({});

  const getChartColors = () => {
    const styles = getComputedStyle(document.documentElement);
    return {
      blue: styles.getPropertyValue('--chart-blue'),
      green: styles.getPropertyValue('--chart-green'),
      orange: styles.getPropertyValue('--chart-orange'),
      purple: styles.getPropertyValue('--chart-purple'),
      red: styles.getPropertyValue('--chart-red'),
    };
  };

  useEffect(() => {
    console.log('Dashboard useEffect running');
    const fetchData = async () => {
      console.log('Fetching dashboard data');
      try {
        const taskStatsData = await getTaskStats();
        setTaskStats(taskStatsData);
        setLoading(true);

        // Fetch stats first
        const statsResponse = await apiClient.getAllStats();
        console.log('Stats response:', statsResponse);

        if (!Array.isArray(statsResponse)) {
          throw new Error('Invalid stats response format');
        }

        const statsData = statsResponse.map((stat: Stat) => ({
          ...stat,
          icon: iconMap[stat.title as keyof typeof iconMap],
          color: colorMap[stat.title as keyof typeof colorMap],
        }));

        setStats(statsData);

        // Fetch chart data separately
        try {
          const colors = getChartColors();
          const [chatTrendData, userTrendData, reviewDistData] =
            await Promise.all([
              apiClient.getChatActivityTrend(),
              apiClient.getUserRegistrationTrend(),
              apiClient.getReviewDistribution(),
            ]);

          // Apply theme colors to the charts
          const chatTrend = {
            ...chatTrendData,
            datasets: chatTrendData.datasets.map((dataset: any) => ({
              ...dataset,
              borderColor: colors.blue,
              backgroundColor: colors.blue + '40',
            })),
          };

          const userTrend = {
            ...userTrendData,
            datasets: userTrendData.datasets.map((dataset: any) => ({
              ...dataset,
              backgroundColor: colors.purple,
              borderColor: colors.purple,
            })),
          };

          const reviewDist = {
            ...reviewDistData,
            datasets: reviewDistData.datasets.map((dataset: any) => ({
              ...dataset,
              backgroundColor: [
                colors.red,
                colors.orange,
                colors.blue,
                colors.green,
                colors.purple,
              ],
              borderColor: [
                colors.red,
                colors.orange,
                colors.blue,
                colors.green,
                colors.purple,
              ],
            })),
          };

          console.log('Chart data received:', {
            chatTrend,
            userTrend,
            reviewDist,
          });

          setChartData({
            chatTrend: chatTrend || { labels: [], datasets: [] },
            userTrend: userTrend || { labels: [], datasets: [] },
            reviewDist: reviewDist || { labels: [], datasets: [] },
          });
        } catch (chartErr: any) {
          console.error('Error fetching chart data:', chartErr);
          // Don't fail completely if charts fail to load
          setChartData({
            chatTrend: { labels: [], datasets: [] },
            userTrend: { labels: [], datasets: [] },
            reviewDist: { labels: [], datasets: [] },
          });
        }

        setError('');
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError(
          err.response?.data?.message || 'Failed to load dashboard data'
        );
        setStats([]);
        setChartData({
          chatTrend: { labels: [], datasets: [] },
          userTrend: { labels: [], datasets: [] },
          reviewDist: { labels: [], datasets: [] },
        });
      } finally {
        setLoading(false);
        console.log('Dashboard data fetch completed');
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1
          style={{ color: 'var(--text-primary)' }}
          className="text-2xl font-bold"
        >
          Welcome back, {user?.name}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }} className="mt-1">
          Here's what's happening with your platform today.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--error)',
            borderColor: 'var(--error)',
            color: 'var(--card-background)',
          }}
          className="mb-6 p-4 bg-opacity-10 border rounded-lg"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value.toLocaleString()}
            color={stat?.color || 'bg-gray-400'}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {taskStats && <TaskStatsChart stats={taskStats} />}
        <ChartCard
          title="Chat Activity (Messages)"
          type="line"
          data={chartData.chatTrend}
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="User Registration Trend"
          type="bar"
          data={chartData.userTrend}
          height={300}
        />
        <ChartCard
          title="Review Rating Distribution"
          type="doughnut"
          data={chartData.reviewDist}
          height={300}
        />
      </div>
    </>
  );
};

export default Dashboard;
