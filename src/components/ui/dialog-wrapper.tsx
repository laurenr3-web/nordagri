
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DialogWrapperProps {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export const DialogWrapper: React.FC<DialogWrapperProps> = ({
  title,
  description,
  open,
  onOpenChange,
  children,
  maxWidth = "sm:max-w-[600px]"
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${maxWidth} dialog-mobile-friendly`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="form-scrollable">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogWrapper;
