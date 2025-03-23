
import React from 'react';
import { Input } from '@/components/ui/input';
import { FormControl } from '@/components/ui/form';
import { Image } from 'lucide-react';

interface ImageUrlInputProps {
  value: string;
  onChange: (value: string) => void;
}

const ImageUrlInput: React.FC<ImageUrlInputProps> = ({ value, onChange }) => {
  return (
    <FormControl>
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Image className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input 
          placeholder="Enter image URL" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </FormControl>
  );
};

export default ImageUrlInput;
