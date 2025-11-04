// File: src/components/LanguageSwitcher.jsx
import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const languages = [
  { code: 'en', name: 'English', emoji: '🇺🇸' },
  { code: 'es', name: 'Español', emoji: '🇪🇸' },
  { code: 'fr', name: 'Français', emoji: '🇫🇷' },
  { code: 'de', name: 'Deutsch', emoji: '🇩🇪' },
  { code: 'zh', name: '中文', emoji: '🇨🇳' },
  { code: 'ru', name: 'Русский', emoji: '🇷🇺' },
  { code: 'ar', name: 'العربية', emoji: '🇸🇦' },
  { code: 'pt', name: 'Português', emoji: '🇧🇷' },
  { code: 'ja', name: '日本語', emoji: '🇯🇵' },
  { code: 'hi', name: 'हिन्दी', emoji: '🇮🇳' },
];

  return (
    <div className="relative">
      <button
        onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
      >
        <span className="text-xl">{languages.find(l => l.name === selectedLanguage)?.flag}</span>
        <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
          {selectedLanguage}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 transition-colors duration-300" />
      </button>

      {languageMenuOpen && (
        <>
          {/* Backdrop to close menu */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setLanguageMenuOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20 transition-colors duration-300">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLanguage(lang.name);
                  setLanguageMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                  selectedLanguage === lang.name ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  {lang.name}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
