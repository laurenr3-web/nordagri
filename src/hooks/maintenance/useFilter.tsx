
import { useState, useMemo } from 'react';
import { MaintenanceTask } from './maintenanceSlice';

export const useFilter = (tasks: MaintenanceTask[]) => {
  const [filterValue, setFilterValue] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Generate filter options based on task types
  const filterOptions = useMemo(() => {
    const types = [...new Set(tasks.map(task => task.type))];
    return types.map(type => ({
      label: type === 'preventive' ? 'Préventive' : 
             type === 'corrective' ? 'Corrective' : 
             type === 'condition-based' ? 'Conditionnelle' : 
             type,
      value: type
    }));
  }, [tasks]);
  
  // Apply filters to tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Apply type filter
      const typeMatch = filterValue === 'all' || task.type === filterValue;
      
      // Apply search filter
      const searchLower = searchQuery.toLowerCase();
      const searchMatch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchLower) ||
        task.equipment.toLowerCase().includes(searchLower) ||
        (task.notes && task.notes.toLowerCase().includes(searchLower)) ||
        (task.assignedTo && task.assignedTo.toLowerCase().includes(searchLower));
      
      return typeMatch && searchMatch;
    });
  }, [tasks, filterValue, searchQuery]);
  
  return {
    filteredTasks,
    filterValue,
    setFilterValue,
    searchQuery,
    setSearchQuery,
    filterOptions
  };
};
