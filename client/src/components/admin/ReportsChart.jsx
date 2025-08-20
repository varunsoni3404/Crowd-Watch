// src/components/admin/ReportsChart.js
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';

const COLORS = {
  Potholes: '#8884d8',
  Sanitation: '#82ca9d',
  Streetlights: '#ffc658',
  'Water Supply': '#ff7300',
  Drainage: '#00ff00',
  Traffic: '#0088fe',
  Parks: '#ffbb28',
  Other: '#ff8042'
};

const STATUS_COLORS = {
  Submitted: '#fbbf24',
  'In Progress': '#3b82f6',
  Resolved: '#10b981'
};

const ReportsChart = ({ stats }) => {
  if (!stats) return null;

  // Prepare data for charts
  const categoryData = stats.reportsByCategory || [];
  const statusData = stats.reportsByStatus || [];
  const timeData = stats.reportsOverTime || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Reports by Category */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="_id" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="count" 
                fill={(entry) => COLORS[entry._id] || '#8884d8'}
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry._id] || '#8884d8'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports by Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ _id, count, percent }) => `${_id}: ${count} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="_id"
              >
                {statusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry._id] || '#8884d8'} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports Over Time */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports Over Time (30 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="_id" 
                angle={-45}
                textAnchor="end"
                height={60}
                fontSize={10}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString();
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportsChart;