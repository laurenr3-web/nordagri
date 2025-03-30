
import React, { useRef, useEffect, useCallback } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { 
  Dialog as ShadcnDialog, 
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';

export interface SafeDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  [key: string]: any; // For additional props
}

const SafeDialog: React.FC<SafeDialogProps> = ({ 
  children, 
  open, 
  onOpenChange,
  ...props 
}) => {
  // Use a ref to track mount state
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => { 
      isMountedRef.current = false; 
    };
  }, []);
  
  const handleOpenChange = useCallback((open: boolean) => {
    if (isMountedRef.current && onOpenChange) {
      // Use requestAnimationFrame for better synchronization with browser rendering
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          onOpenChange(open);
        }
      });
    }
  }, [onOpenChange]);
  
  return (
    <ShadcnDialog
      open={open}
      onOpenChange={handleOpenChange}
      {...props}
    >
      {children}
    </ShadcnDialog>
  );
};

// Re-export dialog subcomponents for convenience
export const SafeDialogContent = DialogContent;
export const SafeDialogHeader = DialogHeader;
export const SafeDialogFooter = DialogFooter;
export const SafeDialogTitle = DialogTitle;
export const SafeDialogDescription = DialogDescription;
export const SafeDialogClose = DialogClose;

// Export types
export type { SafeDialogProps };

// Default export
export default SafeDialog;
