
import React from 'react';
import { Input } from '@/components/ui/input';

interface ImageUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ImageUrlInput: React.FC<ImageUrlInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "https://example.com/image.jpg" 
}) => {
  return (
    <Input 
      type="text" 
      placeholder={placeholder}
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
      className="flex-1"
    />
  );
};

export default ImageUrlInput;
