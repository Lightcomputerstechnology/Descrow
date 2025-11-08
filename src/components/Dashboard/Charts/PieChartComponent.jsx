import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PieChartComponent = ({ data, title = "Buying vs Selling" }) => {
  // Sample data
  const chartData = data || [
    { name: 'Buying', value: 12500, color: '#3B82F6' },
    { name: 'Selling', value: 8500, color: '#8B5CF6' }
  ];

  const COLORS = chartData.map(item => item.color);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            {data.name}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            ${data.value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value, entry) => (
              <span className="text-gray-900 dark:text-white text-sm">
                {value}: ${entry.payload.value.toLocaleString()}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
