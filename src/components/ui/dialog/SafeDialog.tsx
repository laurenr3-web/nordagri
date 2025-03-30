
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
      
      // Cleanup orphaned portal elements on unmount
      setTimeout(() => {
        const portals = document.querySelectorAll('[data-radix-portal]');
        portals.forEach(portal => {
          if (portal.children.length === 0 && portal.parentNode) {
            try {
              portal.parentNode.removeChild(portal);
            } catch (e) {
              console.warn('Portal cleanup error:', e);
            }
          }
        });
      }, 100); // Small delay to ensure React has finished with portals
    };
  }, []);
  
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (isMountedRef.current && onOpenChange) {
      // Use requestAnimationFrame for better synchronization with browser rendering
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          onOpenChange(newOpen);
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
