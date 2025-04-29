
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

// Palette de couleurs à fort contraste pour les barres
const COLORS = [
  '#3B82F6', // blue-500 (bleu vif)
  '#10B981', // emerald-500 (vert émeraude)
  '#F59E0B', // amber-500 (ambre)
  '#8B5CF6', // violet-500 (violet vif)
  '#EC4899', // pink-500 (rose vif)
  '#F97316', // orange-500 (orange vif)
  '#06B6D4', // cyan-500 (cyan vif)
  '#EF4444', // red-500 (rouge vif)
  '#14B8A6', // teal-500 (sarcelle)
  '#6366F1', // indigo-500 (indigo vif)
  '#D946EF', // fuchsia-500 (fuchsia)
  '#0EA5E9', // sky-500 (bleu ciel)
  '#84CC16', // lime-500 (citron vert)
  '#0891B2', // cyan-600 (cyan foncé)
  '#9333EA', // purple-600 (violet foncé)
  '#4F46E5', // indigo-600 (indigo foncé)
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
                fill={COLORS[index % COLORS.length]}
                className="hover:opacity-80 transition-opacity"
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
