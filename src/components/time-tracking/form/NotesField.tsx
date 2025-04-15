
import React from 'react';
import { Input } from '@/components/ui/input';

interface NotesFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotesField({ value, onChange }: NotesFieldProps) {
  return (
    <div className="grid gap-2">
      <Input
        placeholder="Add notes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
