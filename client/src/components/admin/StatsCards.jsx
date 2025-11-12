import React from 'react';
import useTranslation from '../../hooks/useTranslation';

const StatsCards = ({ stats }) => {
  const { t } = useTranslation();
  
  if (!stats) return null;

  const statItems = [
    {
      name: t('admin.totalReports'),
      value: stats.totalReports,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-500',
      gradientFrom: 'from-blue-50',
      gradientTo: 'to-blue-100'
    },
    {
      name: t('admin.pendingReports'),
      value: stats.submittedReports,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500',
      borderColor: 'border-yellow-500',
      gradientFrom: 'from-yellow-50',
      gradientTo: 'to-yellow-100'
    },
    {
      name: t('admin.inProgressReports'),
      value: stats.inProgressReports,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
      borderColor: 'border-orange-500',
      gradientFrom: 'from-orange-50',
      gradientTo: 'to-orange-100'
    },
    {
      name: t('admin.resolvedReports'),
      value: stats.resolvedReports,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      borderColor: 'border-green-500',
      gradientFrom: 'from-green-50',
      gradientTo: 'to-green-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <div key={item.name} className={`bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 border-t-4 ${item.borderColor}`}>
          <div className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${item.gradientFrom} ${item.gradientTo}`}>
                <div className={item.color}>
                  {item.icon}
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">{item.name}</h3>
                <p className={`text-3xl font-bold mt-1 ${item.color}`}>{item.value}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;