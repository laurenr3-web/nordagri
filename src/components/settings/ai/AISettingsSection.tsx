
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';

export const AISettingsSection = () => {
  const [model, setModel] = useState('claude-3-haiku');
  const [temperature, setTemperature] = useState(70);
  const [enableContext, setEnableContext] = useState(true);
  
  const handleSaveSettings = () => {
    // Dans une application réelle, nous sauvegarderions ces paramètres dans une base de données
    localStorage.setItem('ai-model', model);
    localStorage.setItem('ai-temperature', temperature.toString());
    localStorage.setItem('ai-enable-context', enableContext.toString());
    
    toast.success('Paramètres IA enregistrés');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
          <BrainCircuit className="h-8 w-8 text-secondary-foreground" />
        </div>
        
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <Label htmlFor="ai-model">Modèle d'IA</Label>
            <Select defaultValue={model} onValueChange={setModel}>
              <SelectTrigger id="ai-model">
                <SelectValue placeholder="Sélectionner un modèle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku (Rapide)</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet (Équilibré)</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus (Avancé)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Le modèle Claude 3 Haiku est recommandé pour la plupart des utilisations
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature">Créativité (Température): {temperature/100}</Label>
              <span className="text-sm text-muted-foreground">
                {temperature < 30 ? 'Précis' : temperature > 70 ? 'Créatif' : 'Équilibré'}
              </span>
            </div>
            <Slider
              id="temperature"
              min={1}
              max={100}
              step={1}
              value={[temperature]}
              onValueChange={(vals) => setTemperature(vals[0])}
            />
            <p className="text-xs text-muted-foreground">
              Une valeur basse donne des réponses plus précises, une valeur élevée des réponses plus créatives
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="enable-context">Contexte agricole</Label>
              <p className="text-sm text-muted-foreground">
                Permettre à l'IA d'accéder au contexte de vos opérations agricoles
              </p>
            </div>
            <Switch 
              id="enable-context" 
              checked={enableContext}
              onCheckedChange={setEnableContext}
            />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="ai-enabled">Activer l'assistant IA</Label>
              <p className="text-sm text-muted-foreground">
                Activer ou désactiver l'assistant IA dans l'application
              </p>
            </div>
            <Switch id="ai-enabled" defaultChecked />
          </div>
        </div>
      </div>
      
      <Button onClick={handleSaveSettings}>Enregistrer les paramètres IA</Button>
    </div>
  );
};
