import React from 'react';
import useTranslation from '../../hooks/useTranslation';

const FormHeader = ({ onBack }) => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('common.back')}
      </button>
      <h1 className="text-3xl font-bold text-gray-900">{t('user.reportIssue')}</h1>
      <p className="text-gray-600 mt-2">{t('app.tagline')}</p>
    </div>
  );
};

export default FormHeader;