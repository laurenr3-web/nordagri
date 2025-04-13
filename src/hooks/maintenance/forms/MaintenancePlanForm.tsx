
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { MaintenanceFrequency, MaintenanceUnit, MaintenanceType, MaintenancePriority } from '../types/maintenancePlanTypes';

interface MaintenancePlanFormProps {
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  equipmentOptions?: { id: number; name: string }[];
  isLoadingEquipment?: boolean;
  defaultValues?: {
    equipment?: string;
    title?: string;
    type?: MaintenanceType;
    frequency?: MaintenanceFrequency;
    interval?: number;
    unit?: MaintenanceUnit;
    priority?: MaintenancePriority;
  };
  onCancel?: () => void;
}

const MaintenancePlanForm: React.FC<MaintenancePlanFormProps> = ({
  onSubmit,
  isSubmitting = false,
  equipmentOptions = [],
  isLoadingEquipment = false,
  defaultValues = {},
  onCancel = () => {},
}) => {
  const [title, setTitle] = useState(defaultValues.title || '');
  const [equipment, setEquipment] = useState(defaultValues.equipment || '');
  const [type, setType] = useState<MaintenanceType>(defaultValues.type || 'preventive');
  const [frequency, setFrequency] = useState<MaintenanceFrequency>(defaultValues.frequency || 'monthly');
  const [interval, setInterval] = useState(defaultValues.interval || 1);
  const [unit, setUnit] = useState<MaintenanceUnit>(defaultValues.unit || 'months');
  const [nextDueDate, setNextDueDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MaintenancePriority>(defaultValues.priority || 'medium');
  const [engineHours, setEngineHours] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !equipment) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    onSubmit({
      title,
      equipment,
      type,
      frequency,
      interval,
      unit,
      nextDueDate,
      description,
      priority,
      engineHours: engineHours ? parseFloat(engineHours) : undefined,
      assignedTo
    });
  };
  
  const handleFrequencyChange = (value: MaintenanceFrequency) => {
    setFrequency(value);
    
    // Set default unit based on frequency
    switch (value) {
      case 'daily':
        setUnit('days');
        setInterval(1);
        break;
      case 'weekly':
        setUnit('weeks');
        setInterval(1);
        break;
      case 'monthly':
        setUnit('months');
        setInterval(1);
        break;
      case 'quarterly':
        setUnit('months');
        setInterval(3);
        break;
      case 'semi-annual':
      case 'biannual':
        setUnit('months');
        setInterval(6);
        break;
      case 'annual':
      case 'yearly':
        setUnit('years');
        setInterval(1);
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Titre *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du plan de maintenance"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="equipment">Équipement *</Label>
          {defaultValues.equipment ? (
            <Input 
              id="equipment" 
              value={equipment} 
              readOnly 
              className="bg-muted" 
            />
          ) : (
            <Select value={equipment} onValueChange={setEquipment}>
              <SelectTrigger id="equipment">
                <SelectValue placeholder="Sélectionnez un équipement" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingEquipment ? (
                  <SelectItem value="loading" disabled>Chargement...</SelectItem>
                ) : equipmentOptions.length > 0 ? (
                  equipmentOptions.map((eq) => (
                    <SelectItem key={eq.id} value={eq.name}>
                      {eq.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>Aucun équipement disponible</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type de maintenance *</Label>
          <Select value={type} onValueChange={(value) => setType(value as MaintenanceType)}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Type de maintenance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preventive">Préventive</SelectItem>
              <SelectItem value="predictive">Prédictive</SelectItem>
              <SelectItem value="corrective">Corrective</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="priority">Priorité</Label>
          <Select value={priority} onValueChange={(value) => setPriority(value as MaintenancePriority)}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Basse</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="frequency">Fréquence *</Label>
          <Select 
            value={frequency} 
            onValueChange={(value) => handleFrequencyChange(value as MaintenanceFrequency)}
          >
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Fréquence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Quotidienne</SelectItem>
              <SelectItem value="weekly">Hebdomadaire</SelectItem>
              <SelectItem value="monthly">Mensuelle</SelectItem>
              <SelectItem value="quarterly">Trimestrielle</SelectItem>
              <SelectItem value="biannual">Semestrielle</SelectItem>
              <SelectItem value="annual">Annuelle</SelectItem>
              <SelectItem value="custom">Personnalisée</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {frequency === 'custom' && (
          <>
            <div>
              <Label htmlFor="interval">Intervalle</Label>
              <Input
                id="interval"
                type="number"
                min="1"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div>
              <Label htmlFor="unit">Unité</Label>
              <Select value={unit} onValueChange={(value) => setUnit(value as MaintenanceUnit)}>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Unité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Jours</SelectItem>
                  <SelectItem value="weeks">Semaines</SelectItem>
                  <SelectItem value="months">Mois</SelectItem>
                  <SelectItem value="years">Années</SelectItem>
                  <SelectItem value="hours">Heures moteur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nextDueDate">Date de début *</Label>
          <DatePicker
            date={nextDueDate}
            setDate={setNextDueDate}
          />
        </div>
        
        <div>
          <Label htmlFor="engineHours">Heures estimées</Label>
          <Input
            id="engineHours"
            type="number"
            step="0.5"
            min="0"
            value={engineHours}
            onChange={(e) => setEngineHours(e.target.value)}
            placeholder="Durée estimée"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="assignedTo">Assigné à</Label>
        <Input
          id="assignedTo"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Nom du technicien"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description détaillée du plan de maintenance"
          rows={4}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Création...' : 'Créer le plan'}
        </Button>
      </div>
    </form>
  );
};

export default MaintenancePlanForm;
