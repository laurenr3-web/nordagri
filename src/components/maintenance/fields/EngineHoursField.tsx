
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import FormFieldGroup from './FormFieldGroup';
import { Info } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface EngineHoursFieldProps {
  engineHours: string;
  setEngineHours: (hours: string) => void;
  error?: string;
  description?: string;
  placeholder?: string;
}

const EngineHoursField: React.FC<EngineHoursFieldProps> = ({ 
  engineHours, 
  setEngineHours,
  error,
  description = "Nombre d'heures de fonctionnement du moteur",
  placeholder = "Ex: 25.5"
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Accepter une chaîne vide ou un chiffre positif avec décimales
    if (value === '' || (/^\d*\.?\d*$/.test(value) && !isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
      setEngineHours(value);
    }
  };

  // Format visuel optimal
  const formattedValue = engineHours === '' ? '' : engineHours;

  return (
    <FormFieldGroup>
      <div className="flex items-center">
        <Label htmlFor="engineHours" className={cn("flex-1", error ? "text-destructive" : "")}>
          Heures moteur
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="relative">
        <Input
          id="engineHours"
          type="text"
          inputMode="decimal"
          value={formattedValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            error ? "border-destructive focus-visible:ring-destructive" : "",
            "pr-8"
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "engineHours-error" : undefined}
          required
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-sm">
          h
        </div>
      </div>
      
      {error && (
        <div 
          id="engineHours-error" 
          className="text-sm font-medium text-destructive mt-1 animate-shake"
        >
          {error}
        </div>
      )}
      
      {!error && description && (
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      )}
    </FormFieldGroup>
  );
};

// Fonction utilitaire cn importée de lib/utils
import { cn } from '@/lib/utils';

export default EngineHoursField;
