import React from 'react';
import useTranslation from '../../hooks/useTranslation';

const LanguageSwitcher = () => {
  const { language, changeLanguage, availableLanguages } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Change language"
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
