'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './theme-provider';
import { useLanguage } from './language-provider';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useLanguage();

  const themes = [
    { value: 'light', label: t.theme.light, icon: Sun },
    { value: 'dark', label: t.theme.dark, icon: Moon },
    { value: 'system', label: t.theme.system, icon: Monitor },
  ] as const;

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {themes.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              isActive
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            title={label}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
} 