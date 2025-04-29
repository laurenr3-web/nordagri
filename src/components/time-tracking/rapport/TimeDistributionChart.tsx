
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

// Palette de couleurs avec contraste maximal pour les barres
const COLORS = [
  '#2563EB', // blue-600 (bleu foncé)
  '#059669', // emerald-600 (vert émeraude foncé)
  '#DC2626', // red-600 (rouge vif)
  '#7C3AED', // violet-600 (violet intense)
  '#D97706', // amber-600 (ambre foncé)
  '#DB2777', // pink-600 (rose foncé)
  '#0284C7', // sky-600 (bleu ciel foncé)
  '#9333EA', // purple-600 (violet foncé)
  '#EA580C', // orange-600 (orange foncé)
  '#0D9488', // teal-600 (sarcelle foncé)
  '#4338CA', // indigo-600 (indigo foncé)
  '#C026D3', // fuchsia-600 (fuchsia foncé)
  '#65A30D', // lime-600 (citron vert foncé)
  '#0369A1', // sky-700 (bleu ciel très foncé)
  '#6D28D9', // purple-700 (violet très foncé)
  '#1D4ED8', // blue-700 (bleu très foncé)
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
