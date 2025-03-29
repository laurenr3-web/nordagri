
import React, { useEffect, useRef, useState } from 'react';
import AddEquipmentDialog from './AddEquipmentDialog';
import ViewEquipmentDialog from './ViewEquipmentDialog';
import { EquipmentItem } from '@/hooks/equipment/useEquipmentFilters';

interface EquipmentDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  selectedEquipment: EquipmentItem | null;
  setSelectedEquipment: (equipment: EquipmentItem | null) => void;
}

const EquipmentDialogs: React.FC<EquipmentDialogsProps> = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  selectedEquipment,
  setSelectedEquipment
}) => {
  // Use a ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Add local state to control dialog rendering to prevent render/unmount timing issues
  const [shouldRenderAddDialog, setShouldRenderAddDialog] = useState(isAddDialogOpen);
  const [shouldRenderViewDialog, setShouldRenderViewDialog] = useState(!!selectedEquipment);
  
  // Add state to track pending updates
  const pendingUpdatesRef = useRef({
    closeAddDialog: false,
    closeViewDialog: false
  });
  
  // Log component render state for debugging
  useEffect(() => {
    console.log('EquipmentDialogs render state:', { 
      isAddDialogOpen, 
      hasSelectedEquipment: !!selectedEquipment,
      shouldRenderAddDialog,
      shouldRenderViewDialog
    });
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [isAddDialogOpen, selectedEquipment, shouldRenderAddDialog, shouldRenderViewDialog]);

  // Update render state when props change - separate effect for Add Dialog
  useEffect(() => {
    if (isMountedRef.current) {
      // For opening dialog, update immediately
      if (isAddDialogOpen && !shouldRenderAddDialog) {
        setShouldRenderAddDialog(true);
      }
      
      // For closing dialog, delay unmounting to prevent removeChild errors
      if (!isAddDialogOpen && shouldRenderAddDialog) {
        pendingUpdatesRef.current.closeAddDialog = true;
        
        // Use a safer timeout duration to ensure component is fully unmounted
        setTimeout(() => {
          if (isMountedRef.current && pendingUpdatesRef.current.closeAddDialog) {
            setShouldRenderAddDialog(false);
            pendingUpdatesRef.current.closeAddDialog = false;
          }
        }, 300);
      }
    }
  }, [isAddDialogOpen, shouldRenderAddDialog]);
  
  // Separate effect for View Dialog to avoid race conditions
  useEffect(() => {
    if (isMountedRef.current) {
      // For opening dialog, update immediately
      if (selectedEquipment && !shouldRenderViewDialog) {
        setShouldRenderViewDialog(true);
      }
      
      // For closing dialog, delay unmounting to prevent removeChild errors
      if (!selectedEquipment && shouldRenderViewDialog) {
        pendingUpdatesRef.current.closeViewDialog = true;
        
        // Use a safer timeout duration to ensure component is fully unmounted
        setTimeout(() => {
          if (isMountedRef.current && pendingUpdatesRef.current.closeViewDialog) {
            setShouldRenderViewDialog(false);
            pendingUpdatesRef.current.closeViewDialog = false;
          }
        }, 300);
      }
    }
  }, [selectedEquipment, shouldRenderViewDialog]);

  // Safe state updater function with debouncing
  const safeSetIsAddDialogOpen = (open: boolean) => {
    console.log('Setting add dialog open state to:', open);
    if (isMountedRef.current) {
      // Use a safer approach with setTimeout instead of requestAnimationFrame
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsAddDialogOpen(open);
        }
      }, 50);
    }
  };

  // Safe equipment selection function with debouncing
  const safeSetSelectedEquipment = (equipment: EquipmentItem | null) => {
    console.log('Setting selected equipment to:', equipment ? equipment.name : 'null');
    if (isMountedRef.current) {
      // Use a safer approach with setTimeout instead of requestAnimationFrame
      setTimeout(() => {
        if (isMountedRef.current) {
          setSelectedEquipment(equipment);
        }
      }, 50);
    }
  };

  return (
    <>
      {/* Add Equipment Dialog - Only render when needed */}
      {shouldRenderAddDialog && (
        <AddEquipmentDialog 
          isOpen={isAddDialogOpen} 
          onOpenChange={safeSetIsAddDialogOpen}
        />
      )}
      
      {/* View Equipment Dialog - Only render when needed */}
      {shouldRenderViewDialog && (
        <ViewEquipmentDialog 
          equipment={selectedEquipment} 
          onClose={() => safeSetSelectedEquipment(null)}
        />
      )}
    </>
  );
};

export default EquipmentDialogs;
