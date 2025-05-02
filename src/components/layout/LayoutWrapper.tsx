import React from 'react';
interface LayoutWrapperProps {
  children: React.ReactNode;
  className?: string;
}
export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({
  children,
  className = ""
}) => {
  return <main className="px-[162px]">
      {children}
    </main>;
};