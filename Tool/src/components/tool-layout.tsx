'use client';

import { FeedbackButton } from './feedback-button';

interface ToolLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function ToolLayout({ children, title, description }: ToolLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {title && (
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
      <FeedbackButton />
    </div>
  );
}

export default ToolLayout; 