import { useState, useEffect, useCallback } from 'react';
import { useNetworkState } from '@/hooks/useNetworkState';
import { useInterventionService } from '@/services/interventionService';
import { useSyncService } from '@/services/syncService';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

export function useInterventionsWithOffline() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isOnline = useNetworkState();
  const interventionService = useInterventionService();
  const syncService = useSyncService();
  const [localInterventions, setLocalInterventions] = useLocalStorage('offline_interventions', []);
  
  // Fetch interventions from API or local storage
  const fetchInterventions = useCallback(async () => {
    setLoading(true);
    try {
      if (isOnline) {
        // Online: fetch from API
        const data = await interventionService.getAll();
        setInterventions(data);
        // Update local cache
        setLocalInterventions(data);
      } else {
        // Offline: use local cache
        setInterventions(localInterventions);
      }
    } catch (error) {
      console.error('Error fetching interventions:', error);
      setError(error);
      // Fallback to local cache on error
      setInterventions(localInterventions);
    } finally {
      setLoading(false);
    }
  }, [isOnline, interventionService, localInterventions, setLocalInterventions]);
  
  // Initial fetch
  useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);
  
  // Create intervention (works online and offline)
  const createIntervention = useCallback(async (intervention) => {
    try {
      // Generate temporary ID for offline use
      const tempId = uuidv4();
      const newIntervention = { ...intervention, id: tempId, _isOffline: !isOnline };
      
      // Update local state immediately
      setInterventions(prev => [...prev, newIntervention]);
      
      if (isOnline) {
        // Online: create directly via API
        const created = await interventionService.create(intervention);
        // Update local state with server-generated ID
        setInterventions(prev => 
          prev.map(item => item.id === tempId ? created : item)
        );
        // Update local cache
        setLocalInterventions(prev => 
          [...prev.filter(item => item.id !== tempId), created]
        );
        return created;
      } else {
        // Offline: store locally and schedule sync
        setLocalInterventions(prev => [...prev, newIntervention]);
        
        // Schedule sync when back online
        await syncService.scheduleSyncOperation(
          'interventions', 
          tempId, 
          'create', 
          newIntervention, 
          { priority: 1 }
        );
        
        return newIntervention;
      }
    } catch (error) {
      console.error('Error creating intervention:', error);
      setError(error);
      throw error;
    }
  }, [isOnline, interventionService, setLocalInterventions, syncService]);
  
  // Update intervention (works online and offline)
  const updateIntervention = useCallback(async (id, updates) => {
    try {
      // Update local state immediately for better UX
      setInterventions(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      
      if (isOnline) {
        // Online: update via API
        const updated = await interventionService.update(id, updates);
        // Update local cache
        setLocalInterventions(prev => 
          prev.map(item => item.id === id ? updated : item)
        );
        return updated;
      } else {
        // Offline: update locally and schedule sync
        const updatedIntervention = { 
          ...localInterventions.find(item => item.id === id), 
          ...updates, 
          _isOffline: true 
        };
        
        setLocalInterventions(prev => 
          prev.map(item => item.id === id ? updatedIntervention : item)
        );
        
        // Schedule sync when back online
        await syncService.scheduleSyncOperation(
          'interventions', 
          id, 
          'update', 
          updatedIntervention,
          { priority: 2 }
        );
        
        return updatedIntervention;
      }
    } catch (error) {
      console.error(`Error updating intervention ${id}:`, error);
      setError(error);
      throw error;
    }
  }, [isOnline, interventionService, localInterventions, setLocalInterventions, syncService]);
  
  // Delete intervention (works online and offline)
  const deleteIntervention = useCallback(async (id) => {
    try {
      // Update local state immediately
      setInterventions(prev => prev.filter(item => item.id !== id));
      
      if (isOnline) {
        // Online: delete via API
        await interventionService.delete(id);
        // Update local cache
        setLocalInterventions(prev => prev.filter(item => item.id !== id));
      } else {
        // Offline: mark as deleted locally and schedule sync
        setLocalInterventions(prev => prev.filter(item => item.id !== id));
        
        // Schedule sync when back online
        await syncService.scheduleSyncOperation(
          'interventions', 
          id, 
          'delete', 
          { id },
          { priority: 3 }
        );
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting intervention ${id}:`, error);
      setError(error);
      throw error;
    }
  }, [isOnline, interventionService, setLocalInterventions, syncService]);
  
  // Get a single intervention by ID
  const getIntervention = useCallback((id) => {
    return interventions.find(item => item.id === id) || null;
  }, [interventions]);
  
  // Refresh data (useful after sync operations)
  const refreshData = useCallback(() => {
    return fetchInterventions();
  }, [fetchInterventions]);
  
  return {
    interventions,
    loading,
    error,
    isOnline,
    createIntervention,
    updateIntervention,
    deleteIntervention,
    getIntervention,
    refreshData
  };
}
