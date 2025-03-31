
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FormFieldGroup from './FormFieldGroup';

interface NotesFieldProps {
  notes: string;
  setNotes: (notes: string) => void;
}

const NotesField: React.FC<NotesFieldProps> = ({ notes, setNotes }) => {
  return (
    <FormFieldGroup>
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />
    </FormFieldGroup>
  );
};

export default NotesField;
