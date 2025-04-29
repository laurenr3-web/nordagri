
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
    <main className={`max-w-[1200px] mx-auto px-6 py-6 ${className}`}>
      {children}
    </main>
  );
};
