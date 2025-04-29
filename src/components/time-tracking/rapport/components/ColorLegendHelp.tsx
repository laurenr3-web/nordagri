
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

/**
 * Component that displays a help button with color legend tooltip
 */
export const ColorLegendHelp: React.FC = () => {
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
