import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const VolumeChart = ({ data, title = "Monthly Transaction Volume" }) => {
  // Sample data structure
  const chartData = data || [
    { month: 'Jan', buying: 2400, selling: 2000 },
    { month: 'Feb', buying: 1398, selling: 2210 },
    { month: 'Mar', buying: 9800, selling: 2290 },
    { month: 'Apr', buying: 3908, selling: 2000 },
    { month: 'May', buying: 4800, selling: 2181 },
    { month: 'Jun', buying: 3800, selling: 2500 },
    { month: 'Jul', buying: 4300, selling: 2100 },
    { month: 'Aug', buying: 5200, selling: 2800 },
    { month: 'Sep', buying: 6100, selling: 3200 },
    { month: 'Oct', buying: 5800, selling: 3500 },
    { month: 'Nov', buying: 6500, selling: 3800 },
    { month: 'Dec', buying: 7200, selling: 4200 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis 
            dataKey="month" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '14px' }}
            iconType="circle"
          />
          <Line 
            type="monotone" 
            dataKey="buying" 
            stroke="#3B82F6" 
            strokeWidth={3}
            name="Buying"
            dot={{ fill: '#3B82F6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="selling" 
            stroke="#8B5CF6" 
            strokeWidth={3}
            name="Selling"
            dot={{ fill: '#8B5CF6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolumeChart;
