
import React from 'react';
import { Input } from '@/components/ui/input';
import { FormControl, FormItem, FormLabel } from '@/components/ui/form';

interface ImageUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  'aria-describedby'?: string;
  label?: string;
}

const ImageUrlInput: React.FC<ImageUrlInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "https://example.com/image.jpg",
  id,
  'aria-describedby': ariaDescribedby,
  label = "URL de l'image"
}) => {
  return (
    <FormItem>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <FormControl>
        <Input 
          type="text" 
          placeholder={placeholder}
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)} 
          className="flex-1"
          id={id}
          aria-describedby={ariaDescribedby}
        />
      </FormControl>
    </FormItem>
  );
};

export default ImageUrlInput;
