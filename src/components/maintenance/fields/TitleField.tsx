
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import FormFieldGroup from './FormFieldGroup';

interface TitleFieldProps {
  title: string;
  setTitle: (title: string) => void;
}

const TitleField: React.FC<TitleFieldProps> = ({ title, setTitle }) => {
  return (
    <FormFieldGroup>
      <Label htmlFor="title">Titre de la tâche</Label>
      <Input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
    </FormFieldGroup>
  );
};

export default TitleField;
