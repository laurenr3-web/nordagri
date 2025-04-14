
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntryTaskType } from '@/hooks/time-tracking/types';

interface TimeEntryFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: any) => void;
}

interface Equipment {
  id: number;
  name: string;
}

interface Intervention {
  id: number;
  title: string;
}

export function TimeEntryForm({ isOpen, onOpenChange, onSubmit }: TimeEntryFormProps) {
  const [formData, setFormData] = useState({
    equipment_id: undefined as number | undefined,
    intervention_id: undefined as number | undefined,
    task_type: 'maintenance' as TimeEntryTaskType,
    notes: '',
  });
  
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Charger les équipements au chargement
  useEffect(() => {
    if (isOpen) {
      fetchEquipments();
    }
  }, [isOpen]);
  
  // Charger les interventions lorsque l'équipement change
  useEffect(() => {
    if (formData.equipment_id) {
      fetchInterventions(formData.equipment_id);
    } else {
      setInterventions([]);
    }
  }, [formData.equipment_id]);
  
  // Récupérer la liste des équipements
  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      setEquipments(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des équipements:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Récupérer les interventions liées à l'équipement sélectionné
  const fetchInterventions = async (equipmentId: number) => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('id, title')
        .eq('equipment_id', equipmentId)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Conversion explicite pour assurer la compatibilité des types
        const typedInterventions: Intervention[] = data.map(item => ({
          id: item.id,
          title: item.title
        }));
        
        setInterventions(typedInterventions);
      } else {
        setInterventions([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des interventions:", error);
      setInterventions([]);
    }
  };
  
  // Gérer le changement des valeurs du formulaire
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Réinitialiser l'erreur lors de la modification des champs
    setFormError(null);
  };
  
  // Valider et soumettre le formulaire
  const handleSubmit = () => {
    // Valider que l'équipement est sélectionné
    if (!formData.equipment_id) {
      setFormError("Veuillez sélectionner un équipement.");
      return;
    }
    
    // Soumettre les données
    onSubmit(formData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle session de suivi du temps</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {formError && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {formError}
            </div>
          )}
          
          {/* Sélection de l'équipement */}
          <div className="grid gap-2">
            <Label htmlFor="equipment">Équipement *</Label>
            <Select
              value={formData.equipment_id?.toString()}
              onValueChange={(value) => handleChange('equipment_id', parseInt(value))}
              disabled={loading}
            >
              <SelectTrigger id="equipment" className="w-full">
                <SelectValue placeholder="Sélectionner un équipement" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Chargement...
                  </div>
                ) : (
                  equipments.map((equipment) => (
                    <SelectItem key={equipment.id} value={equipment.id.toString()}>
                      {equipment.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Sélection de l'intervention */}
          <div className="grid gap-2">
            <Label htmlFor="intervention">Intervention (optionnel)</Label>
            <Select
              value={formData.intervention_id?.toString() || undefined}
              onValueChange={(value) => handleChange('intervention_id', parseInt(value))}
              disabled={!formData.equipment_id || interventions.length === 0}
            >
              <SelectTrigger id="intervention" className="w-full">
                <SelectValue placeholder="Sélectionner une intervention" />
              </SelectTrigger>
              <SelectContent>
                {interventions.map((intervention) => (
                  <SelectItem key={intervention.id} value={intervention.id.toString()}>
                    {intervention.title}
                  </SelectItem>
                ))}
                {interventions.length === 0 && (
                  <div className="p-2 text-sm text-gray-500">
                    Aucune intervention pour cet équipement
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Type de tâche */}
          <div className="grid gap-2">
            <Label>Type de tâche *</Label>
            <RadioGroup
              value={formData.task_type}
              onValueChange={(value) => handleChange('task_type', value as TimeEntryTaskType)}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maintenance" id="maintenance" />
                <Label htmlFor="maintenance">Maintenance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="repair" id="repair" />
                <Label htmlFor="repair">Réparation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inspection" id="inspection" />
                <Label htmlFor="inspection">Inspection</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="installation" id="installation" />
                <Label htmlFor="installation">Installation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Autre</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Ajoutez des détails sur la tâche..."
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Démarrer le suivi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
