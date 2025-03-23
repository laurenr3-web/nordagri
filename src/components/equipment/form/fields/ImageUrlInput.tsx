
import React from 'react';
import { Input } from '@/components/ui/input';
import { FormControl } from '@/components/ui/form';

interface ImageUrlInputProps {
  value: string;
  onChange: (value: string) => void;
}

const ImageUrlInput: React.FC<ImageUrlInputProps> = ({ value, onChange }) => {
  return (
    <FormControl>
      <Input 
        placeholder="Enter image URL" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormControl>
  );
};

export default ImageUrlInput;
