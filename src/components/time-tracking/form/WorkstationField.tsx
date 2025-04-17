
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface WorkstationFieldProps {
  workstation: string;
  onChange: (field: string, value: string) => void;
  required?: boolean;
}

export function WorkstationField({ workstation, onChange, required = true }: WorkstationFieldProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState(workstation || '');
  const [isLoading, setIsLoading] = useState(false);
  
  // Load workstation suggestions from the database
  useEffect(() => {
    const fetchWorkstations = async () => {
      setIsLoading(true);
      try {
        // Get the most frequently used workstations
        const { data, error } = await supabase
          .from('time_sessions')
          .select('poste_travail')
          .not('poste_travail', 'is', null)
          .order('poste_travail', { ascending: true });
        
        if (error) throw error;
        
        // Create unique list of workstations
        const uniqueWorkstations = Array.from(new Set(
          data
            .map(item => item.poste_travail)
            .filter(Boolean) // Remove null/undefined values
        ));
        
        // If no suggestions found, use default list
        if (uniqueWorkstations.length === 0) {
          setSuggestions([
            'bureau',
            'étable',
            'salle de traite',
            'atelier',
            'entreposage',
            'mobilité',
            'champs',
            'hangar'
          ]);
        } else {
          setSuggestions(uniqueWorkstations);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des postes de travail:', error);
        // Fallback to default list if error
        setSuggestions([
          'bureau',
          'étable',
          'salle de traite',
          'atelier',
          'entreposage',
          'mobilité',
          'champs',
          'hangar'
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkstations();
  }, []);

  // Handle combobox selection
  const handleSelect = (value: string) => {
    onChange('poste_travail', value);
    setInputValue(value);
  };
  
  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onChange('poste_travail', value);
  };
  
  // Format options for the Combobox
  const options = suggestions.map(item => ({
    value: item,
    label: item.charAt(0).toUpperCase() + item.slice(1)
  }));

  return (
    <div className="grid gap-2">
      <Label htmlFor="workstation">
        Poste de travail {required && <span className="text-red-500">*</span>}
      </Label>

      {suggestions.length > 0 ? (
        <div className="relative">
          <Combobox
            options={options}
            placeholder="Sélectionner ou saisir un poste de travail"
            onSelect={handleSelect}
            defaultValue={workstation}
          />
          
          {/* Add a small hint below the field */}
          <p className="text-xs text-muted-foreground mt-1">
            Sélectionnez un poste existant ou saisissez-en un nouveau
          </p>
        </div>
      ) : (
        <Input
          id="workstation"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Saisissez votre poste de travail"
          required={required}
        />
      )}
    </div>
  );
}
