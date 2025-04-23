
import React from 'react';

interface FormFieldGroupProps {
  children: React.ReactNode;
  className?: string;
}

const FormFieldGroup: React.FC<FormFieldGroupProps> = ({ children, className = '' }) => {
  return (
    <div className={`grid gap-2 w-full ${className}`}>
      {children}
    </div>
  );
};

export default FormFieldGroup;
