
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel: () => void;
  loading: boolean;
}

export function FormActions({ onCancel, loading }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        Start Session
      </Button>
    </div>
  );
}
