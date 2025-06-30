'use client';
import React, { useEffect, useState } from 'react';
import { FiMoon } from 'react-icons/fi';

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', newMode);
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
    }
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input className="sr-only peer" type="checkbox" checked={darkMode} readOnly />
      <div
        onClick={toggleDarkMode}
        className="w-12 h-6 sm:w-14 sm:h-7 md:w-16 md:h-8 rounded-full ring-0 peer duration-500 outline-none bg-gray-200 overflow-hidden shadow-lg shadow-gray-400 peer-checked:shadow-gray-700 peer-checked:bg-[#383838] flex items-center justify-between px-1"
      >
        <span className={`transition-opacity duration-500 ${darkMode ? 'opacity-0' : 'opacity-100'}`}>
          <FiMoon className="text-black" />
        </span>
        <span className={`transition-opacity duration-500 ${darkMode ? 'opacity-100' : 'opacity-0'}`}>
          <FiMoon className="text-white" />
        </span>
      </div>
    </label>
  );
}

export default ThemeToggle;
