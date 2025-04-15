
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Timer } from 'lucide-react';

interface MainButtonProps {
  isLoading: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function MainButton({ isLoading, onClick, disabled }: MainButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full p-2 h-10 w-10 flex items-center justify-center"
      onClick={onClick}
      disabled={disabled}
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
