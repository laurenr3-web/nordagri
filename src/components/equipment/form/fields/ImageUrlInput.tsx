
import React from 'react';
import { Input } from '@/components/ui/input';

interface ImageUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  'aria-describedby'?: string;
}

const ImageUrlInput: React.FC<ImageUrlInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "https://example.com/image.jpg",
  id,
  'aria-describedby': ariaDescribedby
}) => {
  return (
    <Input 
      type="text" 
      placeholder={placeholder}
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
      className="flex-1"
      id={id}
      aria-describedby={ariaDescribedby}
    />
  );
};

export default ImageUrlInput;
