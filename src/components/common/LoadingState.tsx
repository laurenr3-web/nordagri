
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Chargement..." }) => (
  <div className="flex items-center justify-center h-[200px]">
    <Loader2 className="w-6 h-6 animate-spin text-primary" />
    <span className="ml-2">{message}</span>
  </div>
);

export default LoadingState;
