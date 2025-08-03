'use client';

import { FeedbackButton } from './feedback-button';

interface ToolLayoutProps {
  children: React.ReactNode;
}

export function ToolLayout({ children }: ToolLayoutProps) {
  return (
    <>
      {children}
      <FeedbackButton />
    </>
  );
} 