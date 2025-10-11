import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartCardProps {
  title: string;
  type: 'bar' | 'line' | 'doughnut';
  data: any;
  height?: number;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  type,
  data,
  height = 300,
}) => {
  const [themeColors, setThemeColors] = React.useState(() => {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    const isDark = root.classList.contains('dark');
    return {
      textColor: isDark ? '#FFFFFF' : '#111827',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      backgroundColor: style.getPropertyValue('--card-background').trim(),
      borderColor: style.getPropertyValue('--card-border').trim(),
    };
  });

  // Update colors when theme changes
  React.useEffect(() => {
    const updateThemeColors = () => {
      const root = document.documentElement;
      const style = getComputedStyle(root);
      const isDark = root.classList.contains('dark');
      setThemeColors({
        textColor: isDark ? '#FFFFFF' : '#111827',
        gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        backgroundColor: style.getPropertyValue('--card-background').trim(),
        borderColor: style.getPropertyValue('--card-border').trim(),
      });
    };

    // Create an observer to watch for class changes on the HTML element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateThemeColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);

  const { textColor, gridColor, backgroundColor, borderColor } = themeColors;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    color: textColor,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        titleColor: textColor,
        bodyColor: textColor,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        padding: 10,
        titleFont: {
          size: 14,
          weight: 600,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales:
      type !== 'doughnut'
        ? {
            x: {
              grid: {
                display: false,
              },
              border: {
                display: false,
              },
              ticks: {
                color: textColor,
                font: {
                  size: 11,
                  weight: 500,
                },
                padding: 8,
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: gridColor,
                drawBorder: false,
              },
              border: {
                display: false,
              },
              ticks: {
                color: textColor,
                font: {
                  size: 11,
                  weight: 500,
                },
                padding: 8,
              },
            },
          }
        : {},
  };

  const renderChart = () => {
    if (!data || !data.datasets || !data.labels) {
      return (
        <div className="flex items-center justify-center h-full">
          <p style={{ color: 'var(--text-secondary)' }}>No data available</p>
        </div>
      );
    }

    try {
      switch (type) {
        case 'bar':
          return <Bar data={data} options={options} />;
        case 'line':
          return <Line data={data} options={options} />;
        case 'doughnut':
          return <Doughnut data={data} options={options} />;
        default:
          return null;
      }
    } catch (error) {
      console.error('Error rendering chart:', error);
      return (
        <div className="flex items-center justify-center h-full">
          <p style={{ color: 'var(--error)' }}>Error displaying chart</p>
        </div>
      );
    }
  };

  return (
    <div
      style={{
        background: 'var(--card-background)',
        borderColor: 'var(--card-border)',
        boxShadow: '0 1px 3px var(--card-shadow)',
      }}
      className="rounded-xl shadow-sm border p-6"
    >
      <h3
        style={{ color: 'var(--text-primary)' }}
        className="text-lg font-semibold mb-6"
      >
        {title}
      </h3>
      <div style={{ height: `${height}px` }}>{renderChart()}</div>
    </div>
  );
};

export default ChartCard;
