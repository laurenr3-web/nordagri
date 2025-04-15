
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Timer } from 'lucide-react';

interface MainButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export function MainButton({ onClick, isLoading }: MainButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full p-2 h-10 w-10 flex items-center justify-center text-gray-700"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="animate-spin">
          <Timer className="h-5 w-5" />
        </div>
      ) : (
        <Clock className="h-5 w-5" />
      )}
    </Button>
  );
}
