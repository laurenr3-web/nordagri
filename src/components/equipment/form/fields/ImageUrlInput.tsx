
import React from 'react';
import { Input } from '@/components/ui/input';

interface ImageUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onBlur?: () => void;
  id?: string;
  "aria-describedby"?: string;
}

const ImageUrlInput: React.FC<ImageUrlInputProps> = ({
  value,
  onChange,
  placeholder = 'URL de l\'image...',
  onBlur,
  id,
  "aria-describedby": ariaDescribedby
}) => {
  return (
    <div className="flex-1">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="w-full"
        id={id}
        aria-describedby={ariaDescribedby}
      />
    </div>
  );
};

export default ImageUrlInput;
