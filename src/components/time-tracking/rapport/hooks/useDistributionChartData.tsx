
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { TaskTypeDistribution } from '@/hooks/time-tracking/useTaskTypeDistribution';
import { normalizeAndGroupTaskTypes } from '../utils/taskTypeUtils';

export const useDistributionChartData = (data: TaskTypeDistribution[], isLoading: boolean) => {
  // Show tooltip explaining colors on first load
  useEffect(() => {
    const hasShownColorInfo = localStorage.getItem('hasShownTimeDistributionColorInfo');
    
    if (!hasShownColorInfo && !isLoading && data && data.length > 0) {
      toast({
        title: "Nouvelle fonctionnalité",
        description: "Les couleurs du graphique indiquent maintenant le type de tâche.",
        duration: 5000,
      });
      
      localStorage.setItem('hasShownTimeDistributionColorInfo', 'true');
    }
  }, [data, isLoading]);

  // Process the chart data
  const processedData = (() => {
    if (!data || data.length === 0) {
      return { chartData: [], totalHours: 0 };
    }

    // Group and normalize the data
    const groupedData = normalizeAndGroupTaskTypes(data);
    
    // Calculate total hours for percentages
    const totalHours = groupedData.reduce((sum, task) => sum + task.hours, 0);

    // Add percentages to the data
    const chartData = groupedData.map(task => ({
      ...task,
      percentage: (task.hours / totalHours) * 100
    }));

    // Calculate dynamic height based on number of items
    // Minimum 300px, or 50px per item
    const chartHeight = Math.max(300, chartData.length * 50);

    return { chartData, totalHours, chartHeight };
  })();

  return processedData;
};
