
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface MaintenancePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: {
    id: number;
    name: string;
  };
}

const MaintenancePlanDialog: React.FC<MaintenancePlanDialogProps> = ({ 
  isOpen,
  onClose,
  equipment
}) => {
  const isMobile = useIsMobile();
  const [title, setTitle] = useState('Plan de maintenance régulier');
  const [description, setDescription] = useState('');
  const [interval, setInterval] = useState('monthly');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [dayOfWeek, setDayOfWeek] = useState('monday');
  const [totalTasks, setTotalTasks] = useState('12');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Plan de maintenance créé avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création du plan de maintenance:', error);
      toast.error("Une erreur est survenue lors de la création du plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Nom du plan</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="equipment">Équipement</Label>
          <Input
            id="equipment"
            value={equipment.name}
            disabled
          />
        </div>
        
        <div>
          <Label htmlFor="interval">Fréquence</Label>
          <Select
            value={interval}
            onValueChange={setInterval}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Quotidienne</SelectItem>
              <SelectItem value="weekly">Hebdomadaire</SelectItem>
              <SelectItem value="biweekly">Bi-hebdomadaire</SelectItem>
              <SelectItem value="monthly">Mensuelle</SelectItem>
              <SelectItem value="quarterly">Trimestrielle</SelectItem>
              <SelectItem value="biannual">Semestrielle</SelectItem>
              <SelectItem value="annual">Annuelle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      
        {interval === 'monthly' && (
          <div>
            <Label htmlFor="dayOfMonth">Jour du mois</Label>
            <Select
              value={dayOfMonth}
              onValueChange={setDayOfMonth}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...Array(31)].map((_, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {interval === 'weekly' && (
          <div>
            <Label htmlFor="dayOfWeek">Jour de la semaine</Label>
            <Select
              value={dayOfWeek}
              onValueChange={setDayOfWeek}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Lundi</SelectItem>
                <SelectItem value="tuesday">Mardi</SelectItem>
                <SelectItem value="wednesday">Mercredi</SelectItem>
                <SelectItem value="thursday">Jeudi</SelectItem>
                <SelectItem value="friday">Vendredi</SelectItem>
                <SelectItem value="saturday">Samedi</SelectItem>
                <SelectItem value="sunday">Dimanche</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div>
          <Label htmlFor="totalTasks">Nombre total de tâches</Label>
          <Input
            id="totalTasks"
            type="number"
            min={1}
            max={100}
            value={totalTasks}
            onChange={(e) => setTotalTasks(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="priority">Priorité</Label>
          <Select
            value={priority}
            onValueChange={setPriority}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Basse</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="pt-4 flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Création en cours...' : 'Créer le plan'}
        </Button>
      </div>
    </form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[95vh]">
        <DialogHeader>
          <DialogTitle>Créer un plan de maintenance</DialogTitle>
        </DialogHeader>
        
        {isMobile ? (
          <ScrollArea className="h-[70vh]">
            {formContent}
          </ScrollArea>
        ) : (
          formContent
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MaintenancePlanDialog;
