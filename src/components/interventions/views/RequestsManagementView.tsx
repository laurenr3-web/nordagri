
import React, { useState } from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Intervention } from '@/types/Intervention';
import { formatDate } from '../utils/interventionUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, FileText, CheckCircle2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { interventionService } from '@/services/supabase/interventionService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PriorityBadge from '../PriorityBadge';

interface RequestsManagementViewProps {
  interventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
}

// Form schema for new intervention request
const formSchema = z.object({
  title: z.string().min(3, { message: 'Le titre doit comporter au moins 3 caractères' }),
  equipment: z.string().min(1, { message: 'Veuillez sélectionner un équipement' }),
  equipmentId: z.number(),
  location: z.string().min(1, { message: 'Veuillez entrer un lieu' }),
  priority: z.enum(['high', 'medium', 'low']),
  date: z.date(),
  scheduledDuration: z.number().min(0.5),
  technician: z.string().min(1, { message: 'Veuillez entrer un technicien' }),
  description: z.string(),
  notes: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const RequestsManagementView: React.FC<RequestsManagementViewProps> = ({ interventions, onViewDetails }) => {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const requests = interventions.filter(i => i.status === 'scheduled');

  // Use React Query to fetch the latest interventions
  const { refetch } = useQuery({
    queryKey: ['interventions'],
    queryFn: () => interventionService.getInterventions(),
    enabled: false // Don't fetch automatically
  });

  // Setup the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      equipment: '',
      equipmentId: 0,
      location: '',
      priority: 'medium',
      date: new Date(),
      scheduledDuration: 1,
      technician: '',
      description: '',
      notes: '',
    }
  });

  const handleCreateRequest = async (values: FormValues) => {
    try {
      await interventionService.addIntervention(values);
      toast.success('Demande d\'intervention créée avec succès');
      setIsRequestDialogOpen(false);
      form.reset();
      refetch(); // Refresh the data
    } catch (error) {
      toast.error('Erreur lors de la création de la demande', { 
        description: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' 
      });
    }
  };

  const handleAcceptRequest = async (intervention: Intervention) => {
    try {
      await interventionService.updateInterventionStatus(intervention.id, 'in-progress');
      toast.success('Demande acceptée, intervention démarrée');
      refetch(); // Refresh interventions list
    } catch (error) {
      toast.error('Erreur lors de l\'acceptation de la demande', { 
        description: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' 
      });
    }
  };

  const handleRejectRequest = async (intervention: Intervention) => {
    try {
      await interventionService.updateInterventionStatus(intervention.id, 'canceled');
      toast.success('Demande rejetée');
      refetch(); // Refresh interventions list
    } catch (error) {
      toast.error('Erreur lors du rejet de la demande', { 
        description: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Demandes d'intervention ({requests.length})</h3>
        <Button 
          onClick={() => setIsRequestDialogOpen(true)}
          size="sm"
          className="gap-1"
        >
          <Plus size={16} />
          <span>Nouvelle demande</span>
        </Button>
      </div>

      {requests.length === 0 ? (
        <BlurContainer className="p-8 text-center">
          <p className="text-muted-foreground">Aucune demande d'intervention en attente</p>
          <Button 
            onClick={() => setIsRequestDialogOpen(true)}
            variant="outline"
            className="mt-4"
          >
            Créer une demande
          </Button>
        </BlurContainer>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {requests.map(request => (
            <Card key={request.id} className="hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium truncate">{request.title}</CardTitle>
                  <PriorityBadge priority={request.priority} />
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Équipement:</span>
                    <span className="truncate">{request.equipment}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Date souhaitée:</span>
                    <span>{formatDate(request.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Durée estimée:</span>
                    <span>{request.scheduledDuration} heures</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Technicien:</span>
                    <span>{request.technician}</span>
                  </div>
                  {request.description && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-end">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs"
                  onClick={() => onViewDetails(request)}
                >
                  <FileText className="mr-1 h-3 w-3" />
                  Détails
                </Button>
                <Button 
                  size="sm"
                  variant="default"
                  className="ml-2 text-xs"
                  onClick={() => handleAcceptRequest(request)}
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Accepter
                </Button>
                <Button 
                  size="sm"
                  variant="destructive"
                  className="ml-2 text-xs"
                  onClick={() => handleRejectRequest(request)}
                >
                  <X className="mr-1 h-3 w-3" />
                  Rejeter
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create new request dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer une demande d'intervention</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateRequest)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre de l'intervention" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorité</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une priorité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">Haute</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="low">Basse</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="equipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Équipement</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'équipement" {...field} />
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
                      <FormLabel>Lieu</FormLabel>
                      <FormControl>
                        <Input placeholder="Lieu de l'intervention" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} 
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scheduledDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée estimée (heures)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.5" 
                          min="0.5"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="technician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technicien</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du technicien" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="equipmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID de l'équipement</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="ID de l'équipement" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
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
                      <Textarea 
                        placeholder="Description détaillée de l'intervention..."
                        rows={3}
                        {...field} 
                      />
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
                    <FormLabel>Notes additionnelles</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Notes importantes ou instructions..."
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer la demande</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestsManagementView;
