
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LabelList } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskTypeDistribution } from '@/hooks/time-tracking/useTaskTypeDistribution';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

// Fonction pour déterminer la couleur d'une tâche selon son type
const getTaskTypeColor = (taskType: string): string => {
  // Convertir en minuscules et supprimer les espaces
  const normalizedType = taskType.toLowerCase().trim();
  
  // Mapping de types de tâches vers des couleurs avec plus de précision
  if (normalizedType.includes('entretien') || normalizedType.includes('maintenance')) {
    return '#60a5fa'; // blue-400 pour plus de contraste
  }
  
  if (normalizedType.includes('opération') || normalizedType.includes('operation')) {
    return '#34d399'; // green-400 pour plus de contraste
  }
  
  if (normalizedType.includes('réparation') || normalizedType.includes('reparation') || 
      normalizedType.includes('repair')) {
    return '#f87171'; // red-400 pour plus de contraste
  }
  
  if (normalizedType.includes('inspection')) {
    return '#fbbf24'; // yellow-400 pour plus de contraste
  }
  
  // Types spécifiques pour l'agriculture
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
  
  // Couleur par défaut
  return '#94a3b8'; // slate-400 pour plus de contraste que le gray-300
};

// Composant d'aide pour l'explication des couleurs
const ColorLegendHelp: React.FC = () => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button 
            className="inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            aria-label="Voir la légende des couleurs"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" className="max-w-xs p-4">
          <div>
            <p className="font-medium mb-2">Chaque couleur représente un type de tâche :</p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-blue-400 mr-2"></span>
                <span>Bleu : Entretien</span>
              </li>
              <li className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-green-400 mr-2"></span>
                <span>Vert : Opération</span>
              </li>
              <li className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-red-400 mr-2"></span>
                <span>Rouge : Réparation</span>
              </li>
              <li className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-yellow-400 mr-2"></span>
                <span>Jaune : Inspection</span>
              </li>
              <li className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-slate-400 mr-2"></span>
                <span>Gris : Autre</span>
              </li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const TimeDistributionChart: React.FC<TimeDistributionChartProps> = ({ 
  data,
  isLoading
}) => {
  // Afficher un toast expliquant les couleurs lors du premier chargement
  React.useEffect(() => {
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

  // Calculer la hauteur dynamique en fonction du nombre d'éléments
  // Minimum 300px, mais au moins 40px par élément
  const chartHeight = Math.max(300, chartData.length * 50);

  return (
    <div className="relative">
      {/* Bouton d'aide avec la légende des couleurs */}
      <div className="absolute right-0 -top-4 z-10">
        <ColorLegendHelp />
      </div>
      
      {/* Conteneur principal avec hauteur maximale et défilement adaptatif */}
      <div className="max-h-[60vh] md:max-h-[500px] overflow-y-auto pr-2 py-2">
        <div 
          className="w-full" 
          style={{ 
            height: chartHeight, 
            minHeight: '300px',
            minWidth: '100%'
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 8, right: 60, left: 20, bottom: 8 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="type" 
                width={120}
                tick={{ 
                  fontSize: 12,
                  width: 100,
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                className="text-xs md:text-sm"
              />
              <RechartsTooltip 
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
                    fill={getTaskTypeColor(entry.type)}
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
      </div>
    </div>
  );
};
