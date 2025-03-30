
import React, { useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { cleanupOrphanedPortals } from '@/utils/dom-helpers';

export interface SafeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SafeDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: SafeDialogProps) {
  const isMounted = useRef(false);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      
      // Cleanup any orphaned portals when unmounting
      setTimeout(() => {
        cleanupOrphanedPortals();
      }, 100);
    };
  }, []);
  
  const handleOpenChange = useCallback((open: boolean) => {
    if (isMounted.current) {
      // Use requestAnimationFrame for better synchronization with browser rendering
      requestAnimationFrame(() => {
        if (isMounted.current) {
          onOpenChange(open);
        }
      });
    }
  }, [onOpenChange]);
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={className}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}

// Export other Dialog components for convenience
export {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
