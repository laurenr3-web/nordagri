
import React from 'react';
import { Input } from '@/components/ui/input';

interface ImageUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  'aria-describedby'?: string;
  onBlur?: () => void; // Ajout d'un handler onBlur
}

const ImageUrlInput: React.FC<ImageUrlInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "https://example.com/image.jpg",
  id,
  'aria-describedby': ariaDescribedby,
  onBlur
}) => {
  return (
    <Input 
      type="text" 
      placeholder={placeholder}
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
      onBlur={onBlur} // Utiliser le handler onBlur
      className="flex-1"
      id={id}
      aria-describedby={ariaDescribedby}
    />
  );
};

export default ImageUrlInput;
