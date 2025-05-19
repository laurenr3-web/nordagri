import { useEffect, useRef } from 'react';
import { FieldValues } from 'react-hook-form';
import { useNetworkState } from '@/hooks/useNetworkState';

export function useAutoSave<T extends FieldValues>(
  formValues: T,
  hasPendingChanges: boolean,
  setHasPendingChanges: (value: boolean) => void,
  saveDraft: (data: T) => Promise<void>,
  autoSave: boolean,
  autoSaveInterval: number,
  lastSaved: Date | null,
) {
  const isOnline = useNetworkState();
  const formStateRef = useRef<T | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Keep track of form values for auto-save
  useEffect(() => {
    formStateRef.current = formValues;
    
    // Mark as having pending changes if we have a previous save
    if (lastSaved) {
      setHasPendingChanges(true);
    }
  }, [formValues, lastSaved, setHasPendingChanges]);
  
  // Set up auto-save interval
  useEffect(() => {
    if (!autoSave || autoSaveInterval <= 0) {
      return;
    }
    
    const saveFormState = async () => {
      if (hasPendingChanges && formStateRef.current) {
        await saveDraft(formStateRef.current);
        setHasPendingChanges(false);
      }
    };
    
    // Clear any existing auto-save interval
    if (timeoutRef.current !== null) {
      clearInterval(timeoutRef.current);
    }
    
    // Set up new interval
    const intervalId = setInterval(saveFormState, autoSaveInterval);
    timeoutRef.current = intervalId;
    
    return () => {
      if (timeoutRef.current !== null) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [autoSave, autoSaveInterval, saveDraft, hasPendingChanges, setHasPendingChanges]);
  
  // Auto-save when going offline
  useEffect(() => {
    if (!isOnline && hasPendingChanges && formStateRef.current) {
      saveDraft(formStateRef.current)
        .then(() => {
          setHasPendingChanges(false);
        })
        .catch((error) => {
          console.error('Error auto-saving when going offline:', error);
        });
    }
  }, [isOnline, hasPendingChanges, saveDraft, setHasPendingChanges]);
  
  return { formStateRef };
}
