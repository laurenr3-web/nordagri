
import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  containerClassName?: string;
  centered?: boolean;
  fullHeight?: boolean;
}

// Optimisation avec React.memo pour éviter les rendus inutiles
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  message = "Chargement...",
  size = "md",
  className,
  containerClassName,
  centered = true,
  fullHeight = true
}) => {
  // Map des tailles pour plus de flexibilité
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };
  
  // Map des tailles pour la marge en bas
  const marginClasses = {
    xs: "mb-2",
    sm: "mb-2",
    md: "mb-4",
    lg: "mb-4",
    xl: "mb-6"
  };

  return (
    <div className={cn(
      "flex flex-col",
      centered && "items-center justify-center",
      fullHeight && "h-full min-h-[200px]",
      containerClassName
    )}>
      <Loader2 className={cn(
        sizeClasses[size],
        marginClasses[size],
        "animate-spin text-primary",
        className
      )} />
      {message && (
        <p className="text-muted-foreground text-sm">{message}</p>
      )}
    </div>
  );
});

// Ajouter un displayName pour améliorer le débogage
LoadingSpinner.displayName = 'LoadingSpinner';
