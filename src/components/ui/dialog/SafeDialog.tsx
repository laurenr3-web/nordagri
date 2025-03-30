
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
import { cleanupOrphanedPortals } from '@/utils/dom-helpers';

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
  
  // Cleanup function to handle orphaned portals
  const cleanupOnClose = useCallback(() => {
    if (open === false) {
      setTimeout(() => {
        cleanupOrphanedPortals();
      }, 100);
    }
  }, [open]);
  
  useEffect(() => {
    isMountedRef.current = true;
    
    // Cleanup when open state changes
    cleanupOnClose();
    
    return () => { 
      isMountedRef.current = false; 
      
      // Cleanup orphaned portal elements on unmount
      setTimeout(() => {
        cleanupOrphanedPortals();
      }, 100);
    };
  }, [open, cleanupOnClose]);
  
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (isMountedRef.current && onOpenChange) {
      // Use requestAnimationFrame for better synchronization with browser rendering
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          onOpenChange(newOpen);
          
          // Cleanup orphaned portals after dialog closes
          if (!newOpen) {
            setTimeout(() => {
              cleanupOrphanedPortals();
            }, 100);
          }
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

// Default export
export default SafeDialog;
