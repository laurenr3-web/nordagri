
import { create } from 'zustand';

interface User {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface Farm {
  id: string;
  name: string;
}

interface GlobalState {
  currentUser: User | null;
  currentFarmId: string | null;
  activeTab: string;
  filters: {
    equipment: {
      category?: string;
      status?: string;
      sort?: string;
      search?: string;
    };
    parts: {
      category?: string;
      lowStock?: boolean;
      sort?: string;
      search?: string;
    };
  };
  timeTracking: {
    isRunning: boolean;
    activeSessionId: string | null;
  };
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setCurrentFarmId: (farmId: string | null) => void;
  setActiveTab: (tab: string) => void;
  setEquipmentFilters: (filters: Partial<GlobalState['filters']['equipment']>) => void;
  setPartsFilters: (filters: Partial<GlobalState['filters']['parts']>) => void;
  setTimeTracking: (data: Partial<GlobalState['timeTracking']>) => void;
}

// Create the store
export const useGlobalStore = create<GlobalState>((set) => ({
  // Initial state
  currentUser: null,
  currentFarmId: null,
  activeTab: 'dashboard',
  filters: {
    equipment: {},
    parts: {}
  },
  timeTracking: {
    isRunning: false,
    activeSessionId: null
  },
  
  // Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentFarmId: (farmId) => set({ currentFarmId: farmId }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setEquipmentFilters: (newFilters) => 
    set((state) => ({
      filters: {
        ...state.filters,
        equipment: {
          ...state.filters.equipment,
          ...newFilters
        }
      }
    })),
  setPartsFilters: (newFilters) => 
    set((state) => ({
      filters: {
        ...state.filters,
        parts: {
          ...state.filters.parts,
          ...newFilters
        }
      }
    })),
  setTimeTracking: (data) => 
    set((state) => ({
      timeTracking: {
        ...state.timeTracking,
        ...data
      }
    }))
}));
