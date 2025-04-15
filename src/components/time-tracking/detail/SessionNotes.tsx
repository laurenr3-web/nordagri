
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SessionNotesProps {
  notes?: string;
  onChange: (notes: string) => void;
  readOnly?: boolean;
}

export const SessionNotes = ({ notes, onChange, readOnly = false }: SessionNotesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={notes || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ajouter des notes sur cette session..."
          className="min-h-[100px]"
          readOnly={readOnly}
        />
      </CardContent>
    </Card>
  );
};
