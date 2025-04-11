
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Chargement...",
  size = "md"
}) => {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }[size];
  
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
      <Loader2 className={`${sizeClass} animate-spin text-primary mb-4`} />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};
