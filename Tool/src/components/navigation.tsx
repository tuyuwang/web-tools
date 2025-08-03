'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';
import { useLanguage } from './language-provider';

export function Navigation() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useLanguage();

  const navItems = [
    { href: '/', label: t.nav.home, icon: Home },
    { href: '/tools', label: t.nav.tools, icon: Wrench },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              工具集
            </span>
          </Link>

          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <LanguageToggle onLanguageChange={setLocale} currentLocale={locale} />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
