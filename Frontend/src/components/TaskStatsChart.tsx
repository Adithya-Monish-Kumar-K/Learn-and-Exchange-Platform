import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getTaskStats } from "../services/taskService";
import type { PieLabelRenderProps } from 'recharts';

const STATUS_ORDER = ["open", "in_progress", "completed", "cancelled", "unknown"];

const TaskStatsChart: React.FC = () => {
  const [statsObj, setStatsObj] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getTaskStats();
        setStatsObj(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetch();
  }, []);

  const chartData = STATUS_ORDER.map((key) => ({
    name: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: statsObj ? Number(statsObj[key] || 0) : 0,
    key,
  }));

  const getVar = (name: string, fallback: string) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  };
  const COLORS = [
    getVar("--chart-blue", "#3b82f6"),
    getVar("--chart-orange", "#f59e0b"),
    getVar("--chart-green", "#10b981"),
    getVar("--chart-red", "#ef4444"),
    getVar("--chart-purple", "#8b5cf6"),
  ];

  return (
    <div
      className="p-6 rounded-lg shadow-md"
      style={{
        backgroundColor: "var(--card-background)",
        color: "var(--text-primary)",
        border: "1px solid var(--card-border)",
      }}
    >
      <h2 className="text-xl font-semibold mb-4">Task Status Overview</h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
label={(props: PieLabelRenderProps) => {
  const { name, percent = 0 } = props;
  return `${name} ${((percent as number) * 100).toFixed(0)}%`;
}}
            isAnimationActive
          >
            {chartData.map((entry, idx) => (
              <Cell key={`cell-${entry.key}`} fill={COLORS[idx % COLORS.length]} stroke="var(--background)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card-background)",
              color: "var(--text-primary)",
              borderColor: "var(--card-border)",
            }}
            formatter={(value: number) => [value, "Tasks"]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.map((d, i) => (
          <div key={d.key} className="flex items-center gap-3">
            <span style={{ background: COLORS[i % COLORS.length], width: 16, height: 16, display: "inline-block", borderRadius: 4 }} />
            <div>
              <div className="font-medium" style={{ color: "var(--text-primary)" }}>{d.name}</div>
              <div className="text-sm" style={{ color: "var(--text-muted)" }}>{d.value} task(s)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskStatsChart;
