
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskTypeDistribution } from '@/hooks/time-tracking/useTaskTypeDistribution';

interface TimeDistributionChartProps {
  data: TaskTypeDistribution[];
  isLoading: boolean;
}

// Fonction pour normaliser et regrouper les types de tâches similaires
const normalizeAndGroupTaskTypes = (data: TaskTypeDistribution[]): TaskTypeDistribution[] => {
  if (!data || data.length === 0) return [];
  
  // Map pour stocker les tâches regroupées
  const groupedTasks = new Map<string, TaskTypeDistribution>();
  
  // Parcourir toutes les tâches et les regrouper par nom normalisé
  data.forEach(task => {
    // Normaliser le nom de la tâche (minuscules, sans espaces en début/fin)
    const normalizedType = task.type.toLowerCase().trim();
    
    if (groupedTasks.has(normalizedType)) {
      // Ajouter les heures à une tâche existante
      const existingTask = groupedTasks.get(normalizedType)!;
      existingTask.hours += task.hours;
    } else {
      // Créer une nouvelle entrée
      groupedTasks.set(normalizedType, {
        ...task,
        type: task.type.charAt(0).toUpperCase() + task.type.slice(1).toLowerCase(), // Capitalize
      });
    }
  });
  
  // Convertir la map en tableau et trier par heures (décroissant)
  return Array.from(groupedTasks.values())
    .sort((a, b) => b.hours - a.hours);
};

// Couleurs pour les barres
const COLORS = [
  '#9b87f5', // Primary Purple
  '#8B5CF6', // Vivid Purple
  '#0EA5E9', // Ocean Blue
  '#D946EF', // Magenta Pink
  '#F97316', // Bright Orange
  '#7E69AB', // Secondary Purple
  '#6E59A5', // Tertiary Purple
];

export const TimeDistributionChart: React.FC<TimeDistributionChartProps> = ({ 
  data,
  isLoading
}) => {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Aucune donnée disponible
      </div>
    );
  }

  // Grouper et normaliser les données
  const groupedData = normalizeAndGroupTaskTypes(data);
  
  // Calculer le total des heures pour les pourcentages
  const totalHours = groupedData.reduce((sum, task) => sum + task.hours, 0);

  // Ajouter les pourcentages aux données
  const chartData = groupedData.map(task => ({
    ...task,
    percentage: (task.hours / totalHours) * 100
  }));

  return (
    <div className="h-[400px] max-h-[500px] overflow-y-auto pr-2">
      <ResponsiveContainer width="100%" height={Math.max(chartData.length * 40, 300)}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey="type" 
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)} heures (${(value / totalHours * 100).toFixed(1)}%)`,
              'Temps passé'
            ]}
            contentStyle={{ 
              backgroundColor: 'var(--background)', 
              borderColor: 'var(--border)',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              padding: '0.75rem'
            }}
          />
          <Bar dataKey="hours" radius={[4, 4, 4, 4]} barSize={30}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || COLORS[index % COLORS.length]} 
              />
            ))}
            <LabelList 
              dataKey="hours" 
              position="right" 
              formatter={(value: number) => `${value.toFixed(1)}h (${(value / totalHours * 100).toFixed(1)}%)`}
              style={{ 
                fontSize: '11px',
                fontWeight: 600,
                textAnchor: 'start',
                fill: 'var(--foreground)',
              }}
              offset={10}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
