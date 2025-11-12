// src/components/admin/ReportsChart.js
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
  LineChart, Line, Legend,
  ResponsiveContainer
} from 'recharts';
import useTranslation from '../../hooks/useTranslation';

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

const getCategoryColor = (id) => COLORS[id] || '#8884d8';
const getStatusColor = (id) => STATUS_COLORS[id] || '#8884d8';

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 p-6">
    <h3 className="text-lg font-bold mb-4 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{title}</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

const ReportsChart = ({ stats }) => {
  const { t } = useTranslation();
  
  if (!stats) return null;

  const categoryData = stats.reportsByCategory || [];
  const statusData = stats.reportsByStatus || [];
  const timeData = stats.reportsOverTime || [];

  const totalReports = (arr) => arr.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Reports by Category */}
      <ChartCard title={`${t('chart.reportsByCategory')} (${totalReports(categoryData)})`}>
        {categoryData.length ? (
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="_id"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
              interval={0}
            />
            <YAxis />
            <Tooltip formatter={(v) => [`${v} ${t('chart.reports')}`, t('chart.count')]} />
            <Bar dataKey="count">
              {categoryData.map((entry, idx) => (
                <Cell key={idx} fill={getCategoryColor(entry._id)} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <p className="text-gray-500 text-sm text-center">{t('chart.noCategoryData')}</p>
        )}
      </ChartCard>

      {/* Reports by Status */}
      <ChartCard title={`${t('chart.statusDistribution')} (${totalReports(statusData)})`}>
        {statusData.length ? (
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              dataKey="count"
              nameKey="_id"
              label={({ count, percent }) =>
                `${count} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {statusData.map((entry, idx) => (
                <Cell key={idx} fill={getStatusColor(entry._id)} />
              ))}
            </Pie>
            <Tooltip formatter={(v, name) => [`${v} ${t('chart.reports')}`, name]} />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              formatter={(value) => (
                <span className="text-gray-700 text-sm">{value}</span>
              )}
            />
          </PieChart>
        ) : (
          <p className="text-gray-500 text-sm text-center">
            {t('chart.noStatusData')}
          </p>
        )}
      </ChartCard>



      {/* Reports Over Time */}
      <ChartCard title={`${t('chart.reportsOverTime')} (${t('chart.30Days')})`}>
        {timeData.length ? (
          <LineChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="_id"
              angle={-45}
              textAnchor="end"
              height={60}
              fontSize={10}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
              interval={0}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(v) => new Date(v).toLocaleDateString()}
              formatter={(val) => [`${val} ${t('chart.reports')}`, t('chart.count')]}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
            />
          </LineChart>
        ) : (
          <p className="text-gray-500 text-sm text-center">{t('chart.noTimeData')}</p>
        )}
      </ChartCard>

    </div>
  );
};

export default ReportsChart;
