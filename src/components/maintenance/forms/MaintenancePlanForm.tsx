
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MaintenanceFrequency, MaintenanceType, MaintenanceUnit, MaintenancePriority } from '@/hooks/maintenance/types/maintenancePlanTypes';

interface MaintenancePlanFormProps {
  onSubmit: (formData: any) => Promise<void>;
  isSubmitting: boolean;
  equipment?: { id: number; name: string } | null;
}

const MaintenancePlanForm: React.FC<MaintenancePlanFormProps> = ({
  onSubmit,
  isSubmitting,
  equipment
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<MaintenanceFrequency>('monthly');
  const [interval, setInterval] = useState(1);
  const [unit, setUnit] = useState<MaintenanceUnit>('months');
  const [nextDueDate, setNextDueDate] = useState<Date>(new Date());
  const [type, setType] = useState<MaintenanceType>('preventive');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const [engineHours, setEngineHours] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [customInterval, setCustomInterval] = useState(false);

  const handleFrequencyChange = (value: string) => {
    setFrequency(value as MaintenanceFrequency);
    setCustomInterval(value === 'custom');

    // Set default interval based on frequency
    switch (value) {
      case 'daily':
        setInterval(1);
        setUnit('days');
        break;
      case 'weekly':
        setInterval(1);
        setUnit('weeks');
        break;
      case 'monthly':
        setInterval(1);
        setUnit('months');
        break;
      case 'quarterly':
        setInterval(3);
        setUnit('months');
        break;
      case 'biannual':
        setInterval(6);
        setUnit('months');
        break;
      case 'yearly':
        setInterval(1);
        setUnit('years');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipment) return;

    try {
      const formData = {
        title,
        description,
        frequency,
        interval,
        unit,
        nextDueDate,
        lastPerformedDate: null,
        type,
        priority,
        engineHours: engineHours ? parseFloat(engineHours) : undefined,
        assignedTo,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        active: true
      };

      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Titre du plan</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Vidange d'huile périodique"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description (optionnelle)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Détails supplémentaires sur la maintenance..."
            rows={3}
          />
        </div>
      </div>

      {/* Schedule Configuration */}
      <div>
        <h3 className="text-lg font-medium mb-4">Calendrier de maintenance</h3>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="frequency">Fréquence</Label>
            <Select value={frequency} onValueChange={handleFrequencyChange} required>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Sélectionner une fréquence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Quotidienne</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="monthly">Mensuelle</SelectItem>
                <SelectItem value="quarterly">Trimestrielle</SelectItem>
                <SelectItem value="biannual">Semestrielle</SelectItem>
                <SelectItem value="yearly">Annuelle</SelectItem>
                <SelectItem value="custom">Personnalisée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="nextDueDate">Première échéance</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nextDueDate ? (
                    format(nextDueDate, "d MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={nextDueDate}
                  onSelect={(date) => date && setNextDueDate(date)}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {customInterval && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
            <div>
              <Label htmlFor="interval">Intervalle</Label>
              <Input
                id="interval"
                type="number"
                min="1"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                required={customInterval}
              />
            </div>

            <div>
              <Label htmlFor="unit">Unité</Label>
              <Select value={unit} onValueChange={(value) => setUnit(value as MaintenanceUnit)} required>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Sélectionner une unité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Jours</SelectItem>
                  <SelectItem value="weeks">Semaines</SelectItem>
                  <SelectItem value="months">Mois</SelectItem>
                  <SelectItem value="years">Années</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Maintenance Details */}
      <div>
        <h3 className="text-lg font-medium mb-4">Détails de maintenance</h3>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="type">Type de maintenance</Label>
            <Select value={type} onValueChange={(value) => setType(value as MaintenanceType)} required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preventive">Préventive</SelectItem>
                <SelectItem value="predictive">Prédictive</SelectItem>
                <SelectItem value="corrective">Corrective</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="lubrication">Lubrification</SelectItem>
                <SelectItem value="electrical">Électrique</SelectItem>
                <SelectItem value="mechanical">Mécanique</SelectItem>
                <SelectItem value="hydraulic">Hydraulique</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priorité</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as MaintenancePriority)} required>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Sélectionner une priorité" />
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
          <div>
            <Label htmlFor="engineHours">Durée estimée (heures)</Label>
            <Input
              id="engineHours"
              type="number"
              step="0.5"
              min="0"
              value={engineHours}
              onChange={(e) => setEngineHours(e.target.value)}
              placeholder="Ex: 2.5"
            />
          </div>

          <div>
            <Label htmlFor="assignedTo">Assigné à (optionnel)</Label>
            <Input
              id="assignedTo"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Nom du technicien"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" disabled={isSubmitting}>
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
