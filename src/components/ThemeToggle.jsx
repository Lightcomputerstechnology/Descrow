// File: src/components/ThemeToggle.jsx
import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
      aria-label="Toggle Theme"
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-yellow-500 transition-transform duration-300 hover:rotate-180" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};

export default ThemeToggle;
