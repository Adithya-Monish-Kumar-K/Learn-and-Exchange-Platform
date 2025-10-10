import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Gift,
  MessageSquare,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  color: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
}

const iconMap: Record<string, LucideIcon> = {
  'Total Users': Users,
  'Tasks Completed': CheckCircle,
  'Active Offers': Gift,
  'Reviews': MessageSquare,
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  color,
  trend,
}) => {
  const Icon = iconMap[title] || Users; // Default to Users icon if title doesn't match
  console.log('StatsCard title:', title, 'Icon found:', !!iconMap[title], 'Color class:', color.replace('bg-', 'text-').replace('-500', '-600')); // Debug log
  return (
    <div
      style={{
        background: 'var(--card-background)',
        borderColor: 'var(--card-border)',
        boxShadow: '0 1px 3px var(--card-shadow)',
      }}
      className="rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}
        >
          <Icon
            className={`w-6 h-6 text-white`}
          />
        </div>
        <div className="flex items-center space-x-1">
          {trend.isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {trend.value}%
          </span>
        </div>
      </div>
      <h3
        style={{ color: 'var(--text-secondary)' }}
        className="text-sm font-medium"
      >
        {title}
      </h3>
      <p
        style={{ color: 'var(--text-primary)' }}
        className="text-2xl font-bold mt-1"
      >
        {value}
      </p>
    </div>
  );
};

export default StatsCard;
