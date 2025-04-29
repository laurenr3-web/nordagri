
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
    <main className={`max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 pb-16 ${className}`}>
      {children}
    </main>
  );
};
