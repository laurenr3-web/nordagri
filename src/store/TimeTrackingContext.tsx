
import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';
import { startOfWeek, endOfWeek } from 'date-fns';
import { TimeEntry } from '@/hooks/time-tracking/types';

// Types pour le state
interface TimeTrackingState {
  activeTab: string;
  isFormOpen: boolean;
  dateRange: {
    from: Date;
    to: Date;
  };
  equipmentFilter?: number;
  taskTypeFilter?: string;
  entries: TimeEntry[];
}

// Type pour les actions
type TimeTrackingAction =
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_FORM_OPEN'; payload: boolean }
  | { type: 'SET_DATE_RANGE'; payload: { from: Date; to: Date } }
  | { type: 'SET_EQUIPMENT_FILTER'; payload: number | undefined }
  | { type: 'SET_TASK_TYPE_FILTER'; payload: string | undefined }
  | { type: 'SET_ENTRIES'; payload: TimeEntry[] }
  | { type: 'RESET_FILTERS' };

// State initial
const initialState: TimeTrackingState = {
  activeTab: 'list',
  isFormOpen: false,
  dateRange: {
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 })
  },
  equipmentFilter: undefined,
  taskTypeFilter: undefined,
  entries: []
};

// Reducer
function timeTrackingReducer(state: TimeTrackingState, action: TimeTrackingAction): TimeTrackingState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_FORM_OPEN':
      return { ...state, isFormOpen: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_EQUIPMENT_FILTER':
      return { ...state, equipmentFilter: action.payload };
    case 'SET_TASK_TYPE_FILTER':
      return { ...state, taskTypeFilter: action.payload };
    case 'SET_ENTRIES':
      return { ...state, entries: action.payload };
    case 'RESET_FILTERS':
      return {
        ...state,
        dateRange: {
          from: startOfWeek(new Date(), { weekStartsOn: 1 }),
          to: endOfWeek(new Date(), { weekStartsOn: 1 })
        },
        equipmentFilter: undefined,
        taskTypeFilter: undefined
      };
    default:
      return state;
  }
}

// Type pour le context
interface TimeTrackingContextType {
  state: TimeTrackingState;
  setActiveTab: (tab: string) => void;
  setIsFormOpen: (isOpen: boolean) => void;
  setDateRange: (range: { from: Date; to: Date }) => void;
  setEquipmentFilter: (equipmentId: number | undefined) => void;
  setTaskTypeFilter: (taskType: string | undefined) => void;
  setEntries: (entries: TimeEntry[]) => void;
  resetFilters: () => void;
}

// Création du context
const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

// Provider
export function TimeTrackingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(timeTrackingReducer, initialState);

  const contextValue = useMemo(() => ({
    state,
    setActiveTab: (tab: string) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
    setIsFormOpen: (isOpen: boolean) => dispatch({ type: 'SET_FORM_OPEN', payload: isOpen }),
    setDateRange: (range: { from: Date; to: Date }) => dispatch({ type: 'SET_DATE_RANGE', payload: range }),
    setEquipmentFilter: (equipmentId: number | undefined) => dispatch({ type: 'SET_EQUIPMENT_FILTER', payload: equipmentId }),
    setTaskTypeFilter: (taskType: string | undefined) => dispatch({ type: 'SET_TASK_TYPE_FILTER', payload: taskType }),
    setEntries: (entries: TimeEntry[]) => dispatch({ type: 'SET_ENTRIES', payload: entries }),
    resetFilters: () => dispatch({ type: 'RESET_FILTERS' })
  }), [state]);

  return (
    <TimeTrackingContext.Provider value={contextValue}>
      {children}
    </TimeTrackingContext.Provider>
  );
}

// Hook pour utiliser le context
export function useTimeTrackingContext() {
  const context = useContext(TimeTrackingContext);
  
  if (context === undefined) {
    throw new Error('useTimeTrackingContext must be used within a TimeTrackingProvider');
  }
  
  return context;
}
