
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Intervention } from '@/types/Intervention';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from '@/components/ui/separator';

import { Calendar, Clock, MapPin, Play, FileCheck, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useInterventionDetail } from '@/hooks/interventions/useInterventionDetail';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon } from "lucide-react"
 
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import InterventionReportDialog from './dialogs/InterventionReportDialog';

interface InterventionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interventionId: number;
  onUpdate: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
  onGenerateReport?: () => void;
  loading?: boolean;
}

const InterventionDetailsDialog: React.FC<InterventionDetailsDialogProps> = ({
  open,
  onOpenChange,
  interventionId,
  onUpdate,
  onStartWork,
  onGenerateReport,
  loading = false
}) => {
  const { intervention } = useInterventionDetail(interventionId);
  const [isEditing, setIsEditing] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  const form = useForm({
    defaultValues: {
      title: '',
      equipment: '',
      location: '',
      priority: 'medium' as 'high' | 'medium' | 'low',
      date: new Date(),
      scheduledDuration: 0,
      technician: '',
      description: '',
      notes: ''
    }
  });

  // Définir les valeurs du formulaire lorsque l'intervention est chargée
  React.useEffect(() => {
    if (intervention) {
      form.reset({
        title: intervention.title,
        equipment: intervention.equipment,
        location: intervention.location,
        priority: intervention.priority,
        date: typeof intervention.date === 'string' 
          ? new Date(intervention.date) 
          : intervention.date,
        scheduledDuration: intervention.scheduledDuration || 0,
        technician: intervention.technician,
        description: intervention.description,
        notes: intervention.notes || ''
      });
    }
  }, [intervention, form]);

  if (loading || !intervention) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = (values: any) => {
    const updatedIntervention: Intervention = {
      ...intervention,
      ...values
    };
    
    onUpdate(updatedIntervention);
    setIsEditing(false);
  };

  const handleStartWork = () => {
    const updatedIntervention: Intervention = {
      ...intervention,
      status: 'in-progress'
    };
    
    onUpdate(updatedIntervention);
    onStartWork(updatedIntervention);
    toast.success(`Intervention "${intervention.title}" démarrée`);
  };

  const handleMarkComplete = () => {
    setIsReportDialogOpen(true);
  };

  const handleCompleteWithReport = (intervention: Intervention, report: any) => {
    const updatedIntervention: Intervention = {
      ...intervention,
      status: 'completed',
      duration: report.duration,
      notes: report.notes,
      partsUsed: report.partsUsed || []
    };
    
    onUpdate(updatedIntervention);
    toast.success(`Intervention "${intervention.title}" marquée comme terminée`);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              {!isEditing ? (
                <>
                  <span>{intervention.title}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-2" 
                    onClick={() => setIsEditing(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                "Modifier l'intervention"
              )}
            </DialogTitle>
            
            {!isEditing && (
              <div className="flex gap-2 mt-2">
                <StatusBadge status={intervention.status} />
                <PriorityBadge priority={intervention.priority} />
              </div>
            )}
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-180px)]">
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="equipment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Équipement</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emplacement</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "P", { locale: fr })
                                  ) : (
                                    <span>Sélectionner une date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                                locale={fr}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="scheduledDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée prévue (heures)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.5" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="technician"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Technicien</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>Priorité</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="low" id="low" />
                                <Label htmlFor="low">Basse</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="medium" id="medium" />
                                <Label htmlFor="medium">Moyenne</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="high" id="high" />
                                <Label htmlFor="high">Haute</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">Enregistrer</Button>
                  </DialogFooter>
                </form>
              </Form>
            ) : (
              <div className="space-y-4 py-2">
                {/* Informations de base */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Date</div>
                      <div>{format(new Date(intervention.date), 'PPP', { locale: fr })}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Durée prévue</div>
                      <div>{intervention.scheduledDuration} heures</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Emplacement</div>
                      <div>{intervention.location || 'Non spécifié'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Technicien</div>
                    <div>{intervention.technician || 'Non assigné'}</div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {/* Description */}
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm whitespace-pre-line">{intervention.description || 'Aucune description'}</p>
                </div>
                
                {/* Notes */}
                {intervention.notes && (
                  <div>
                    <h3 className="font-medium mb-2">Notes</h3>
                    <p className="text-sm whitespace-pre-line">{intervention.notes}</p>
                  </div>
                )}
                
                {/* Pièces utilisées */}
                {intervention.partsUsed && intervention.partsUsed.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Pièces utilisées</h3>
                    <ul className="text-sm space-y-1">
                      {intervention.partsUsed.map((part, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{part.name}</span>
                          <span className="font-medium">{part.quantity} unité(s)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          
          {!isEditing && (
            <div className="flex justify-between gap-2 mt-4">
              <div className="flex gap-2">
                {intervention.status === 'scheduled' && (
                  <Button onClick={handleStartWork}>
                    <Play className="mr-2 h-4 w-4" />
                    Démarrer l'intervention
                  </Button>
                )}
                
                {intervention.status === 'in-progress' && (
                  <Button onClick={handleMarkComplete}>
                    <FileCheck className="mr-2 h-4 w-4" />
                    Marquer comme terminée
                  </Button>
                )}
                
                {onGenerateReport && intervention.status === 'completed' && (
                  <Button onClick={onGenerateReport}>
                    <FileCheck className="mr-2 h-4 w-4" />
                    Générer rapport PDF
                  </Button>
                )}
              </div>
              
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <InterventionReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        intervention={intervention}
        onSubmit={handleCompleteWithReport}
        availableParts={[
          { id: 1, name: 'Filtre à huile', quantity: 10 },
          { id: 2, name: 'Filtre à air', quantity: 5 },
          { id: 3, name: 'Huile moteur', quantity: 20 },
          { id: 4, name: 'Courroie', quantity: 8 }
        ]}
      />
    </>
  );
};

export default InterventionDetailsDialog;
