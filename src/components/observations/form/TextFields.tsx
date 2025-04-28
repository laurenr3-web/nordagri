
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface LocationInputProps {
  value?: string;
  onChange: (value: string) => void;
}

export const LocationInput = ({ value, onChange }: LocationInputProps) => (
  <Input
    placeholder="Localisation (optionnel)"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
  />
);

interface DescriptionTextareaProps {
  value?: string;
  onChange: (value: string) => void;
}

export const DescriptionTextarea = ({ value, onChange }: DescriptionTextareaProps) => (
  <Textarea
    placeholder="Description détaillée (optionnel)"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
  />
);
