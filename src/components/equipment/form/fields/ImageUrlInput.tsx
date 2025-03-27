
import React from 'react';
import { Input } from '@/components/ui/input';

interface ImageUrlInputProps {
  value: string;
  onChange: (value: string) => void;
}

const ImageUrlInput: React.FC<ImageUrlInputProps> = ({ value, onChange }) => {
  return (
    <Input 
      type="text" 
      placeholder="https://example.com/image.jpg" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="flex-1"
    />
  );
};

export default ImageUrlInput;
