
import React from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface DialogHeaderProps {
  title: string;
  description: string;
}

const InterventionDialogHeader: React.FC<DialogHeaderProps> = ({
  title,
  description
}) => {
  return (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>
        {description}
      </DialogDescription>
    </DialogHeader>
  );
};

export default InterventionDialogHeader;
