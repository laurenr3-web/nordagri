
import React from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({
  children,
  className = ""
}) => {
  return (
    <main className={`px-4 sm:px-6 lg:px-8 lg:max-w-[1440px] lg:mx-auto pb-24 lg:pb-6 ${className}`}>
      {children}
    </main>
  );
};
