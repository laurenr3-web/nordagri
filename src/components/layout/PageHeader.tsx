
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description,
  action,
  className = ""
}) => {
  return (
    <div className={`mb-4 sm:mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-center gap-2 sm:gap-4 mb-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight min-w-0 break-words">{title}</h1>
        {action && <div className="w-full sm:w-auto sm:ml-auto">{action}</div>}
      </div>
      {description && (
        <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
      )}
    </div>
  );
};
