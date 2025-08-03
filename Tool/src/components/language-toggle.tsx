'use client';

import { useState, useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';
import { Locale, locales, localeNames, defaultLocale } from '@/lib/i18n';

interface LanguageToggleProps {
  onLanguageChange: (locale: Locale) => void;
  currentLocale: Locale;
}

export function LanguageToggle({ onLanguageChange, currentLocale }: LanguageToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLanguageSelect = (locale: Locale) => {
    onLanguageChange(locale);
    setIsOpen(false);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
        aria-label="切换语言"
      >
        <Globe className="h-4 w-4" />
        <span>{localeNames[currentLocale]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageSelect(locale)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  locale === currentLocale
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {localeNames[locale]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 