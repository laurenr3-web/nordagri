
import { TaskTypeDistribution } from '@/hooks/time-tracking/useTaskTypeDistribution';

/**
 * Normalize and group similar task types to consolidate data
 */
export const normalizeAndGroupTaskTypes = (data: TaskTypeDistribution[]): TaskTypeDistribution[] => {
  if (!data || data.length === 0) return [];
  
  // Map for storing grouped tasks
  const groupedTasks = new Map<string, TaskTypeDistribution>();
  
  // Process all tasks and group by normalized name
  data.forEach(task => {
    // Normalize task name (lowercase, trim)
    const normalizedType = task.type.toLowerCase().trim();
    
    if (groupedTasks.has(normalizedType)) {
      // Add hours to existing task
      const existingTask = groupedTasks.get(normalizedType)!;
      existingTask.hours += task.hours;
    } else {
      // Create new entry
      groupedTasks.set(normalizedType, {
        ...task,
        type: task.type.charAt(0).toUpperCase() + task.type.slice(1).toLowerCase(), // Capitalize
      });
    }
  });
  
  // Convert map to array and sort by hours (descending)
  return Array.from(groupedTasks.values())
    .sort((a, b) => b.hours - a.hours);
};

/**
 * Determine color for a task based on its type
 */
export const getTaskTypeColor = (taskType: string): string => {
  // Convert to lowercase and remove spaces
  const normalizedType = taskType.toLowerCase().trim();
  
  // Task type to color mapping with increased contrast
  if (normalizedType.includes('entretien') || normalizedType.includes('maintenance')) {
    return '#60a5fa'; // blue-400
  }
  
  if (normalizedType.includes('opération') || normalizedType.includes('operation')) {
    return '#34d399'; // green-400
  }
  
  if (normalizedType.includes('réparation') || normalizedType.includes('reparation') || 
      normalizedType.includes('repair')) {
    return '#f87171'; // red-400
  }
  
  if (normalizedType.includes('inspection')) {
    return '#fbbf24'; // yellow-400
  }
  
  // Agriculture-specific types
  if (normalizedType.includes('traite') || normalizedType.includes('milk')) {
    return '#818cf8'; // indigo-400
  }
  
  if (normalizedType.includes('fds') || normalizedType.includes('préparation')) {
    return '#c084fc'; // purple-400
  }
  
  if (normalizedType.includes('étable') || normalizedType.includes('etable') || 
      normalizedType.includes('stable')) {
    return '#fb923c'; // orange-400
  }
  
  if (normalizedType.includes('écurer') || normalizedType.includes('ecurer') || 
      normalizedType.includes('clean')) {
    return '#38bdf8'; // sky-400
  }
  
  // Default color
  return '#94a3b8'; // slate-400
};
