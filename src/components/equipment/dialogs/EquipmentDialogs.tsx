
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
  
  // Track previous state for debugging
  const prevStateRef = useRef({ isAddDialogOpen, hasSelectedEquipment: !!selectedEquipment });
  
  console.log('EquipmentDialogs render state:', { 
    isAddDialogOpen, 
    hasSelectedEquipment: !!selectedEquipment,
    shouldRenderAddDialog,
    shouldRenderViewDialog
  });

  // Update local render state when props change
  useEffect(() => {
    const prevState = prevStateRef.current;
    prevStateRef.current = { isAddDialogOpen, hasSelectedEquipment: !!selectedEquipment };
    
    // Only update render state if component is mounted
    if (isMountedRef.current) {
      // For opening dialogs, update immediately
      if (isAddDialogOpen && !shouldRenderAddDialog) {
        setShouldRenderAddDialog(true);
      }
      
      if (selectedEquipment && !shouldRenderViewDialog) {
        setShouldRenderViewDialog(true);
      }
      
      // For closing dialogs, delay unmounting to prevent removeChild errors
      if (!isAddDialogOpen && shouldRenderAddDialog) {
        // Use a short timeout to prevent unmounting during render cycle
        const timer = setTimeout(() => {
          if (isMountedRef.current) {
            setShouldRenderAddDialog(false);
          }
        }, 300);
        return () => clearTimeout(timer);
      }
      
      if (!selectedEquipment && shouldRenderViewDialog) {
        // Use a short timeout to prevent unmounting during render cycle
        const timer = setTimeout(() => {
          if (isMountedRef.current) {
            setShouldRenderViewDialog(false);
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isAddDialogOpen, selectedEquipment, shouldRenderAddDialog, shouldRenderViewDialog]);

  // Debug dialog state changes
  useEffect(() => {
    console.log('EquipmentDialogs state updated:', {
      isAddDialogOpen,
      selectedEquipment: selectedEquipment ? selectedEquipment.name : 'none',
      shouldRenderAddDialog,
      shouldRenderViewDialog
    });
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [isAddDialogOpen, selectedEquipment, shouldRenderAddDialog, shouldRenderViewDialog]);

  // Safe state updater functions with debouncing
  const safeSetIsAddDialogOpen = (open: boolean) => {
    console.log('Setting add dialog open state to:', open);
    if (isMountedRef.current) {
      // Use requestAnimationFrame for better timing with rendering cycle
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          setIsAddDialogOpen(open);
        }
      });
    }
  };

  // Safe equipment selection function with debouncing
  const safeSetSelectedEquipment = (equipment: EquipmentItem | null) => {
    console.log('Setting selected equipment to:', equipment ? equipment.name : 'null');
    if (isMountedRef.current) {
      // Use requestAnimationFrame for better timing with rendering cycle
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          setSelectedEquipment(equipment);
        }
      });
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
