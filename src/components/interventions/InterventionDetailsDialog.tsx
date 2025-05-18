import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Trash2, Calendar, MapPin, User, Clock, FileText, AlertCircle, Download } from 'lucide-react';
import { Intervention } from '@/types/Intervention';
import { formatDate } from './utils/interventionUtils';
import { DeleteInterventionAlert } from './dialogs/DeleteInterventionAlert';
import { useDeleteIntervention } from '@/hooks/interventions/useDeleteIntervention';
import { exportInterventionToPDF } from '@/utils/pdfExport';
import { toast } from 'sonner';

interface InterventionDetailsDialogProps {
  intervention: Intervention;
  isOpen: boolean;
  onClose: () => void;
  onStartWork: () => void;
  handleInterventionUpdate: (interventionId: number, updates: Partial<Intervention>) => void;
}

const InterventionDetailsDialog: React.FC<InterventionDetailsDialogProps> = ({ 
  intervention, 
  isOpen, 
  onClose, 
  onStartWork,
  handleInterventionUpdate
}) => {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { deleteIntervention, isDeleting } = useDeleteIntervention();

  const handleDelete = () => {
    deleteIntervention(intervention.id, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'canceled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  const handleExportToPDF = async () => {
    try {
      await exportInterventionToPDF(intervention);
      toast.success("Rapport d'intervention exporté avec succès");
    } catch (error) {
      console.error("Erreur lors de l'export du PDF:", error);
      toast.error("Erreur lors de l'export du PDF");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center justify-between">
              <span>{intervention.title}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant={getStatusBadgeVariant(intervention.status)}>
              {intervention.status === 'scheduled' && 'Planifié'}
              {intervention.status === 'in-progress' && 'En cours'}
              {intervention.status === 'completed' && 'Terminé'}
              {intervention.status === 'canceled' && 'Annulé'}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(intervention.priority)}>
              {intervention.priority === 'high' && 'Priorité haute'}
              {intervention.priority === 'medium' && 'Priorité moyenne'}
              {intervention.priority === 'low' && 'Priorité basse'}
            </Badge>
          </div>

          <Card className="mb-4 border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {typeof intervention.date === 'string' 
                          ? formatDate(new Date(intervention.date)) 
                          : formatDate(intervention.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Lieu</p>
                      <p className="font-medium">{intervention.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Wrench className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Équipement</p>
                      <p className="font-medium">{intervention.equipment}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Technicien</p>
                      <p className="font-medium">{intervention.technician || 'Non assigné'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Durée prévue</p>
                    <p className="font-medium">{intervention.scheduledDuration} heure(s)</p>
                  </div>
                </div>

                {intervention.status === 'completed' && intervention.duration && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Durée réelle</p>
                      <p className="font-medium">{intervention.duration} heure(s)</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="whitespace-pre-wrap bg-muted p-3 rounded-md text-sm mt-1">
                      {intervention.description || 'Aucune description'}
                    </p>
                  </div>
                </div>

                {intervention.notes && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="whitespace-pre-wrap bg-muted p-3 rounded-md text-sm mt-1">{intervention.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {intervention.partsUsed && intervention.partsUsed.length > 0 && (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <h3 className="text-md font-medium mb-3">Pièces utilisées</h3>
                <ul className="space-y-2">
                  {intervention.partsUsed.map((part, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <span className="font-medium">{part.name}</span>
                      <Badge variant="outline">Quantité: {part.quantity}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteAlertOpen(true)}
              className="gap-1"
            >
              <Trash2 size={16} />
              <span>Supprimer</span>
            </Button>
            <div className="flex gap-2 ml-auto">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1"
                onClick={handleExportToPDF}
              >
                <Download size={16} />
                <span>Exporter PDF</span>
              </Button>
              {intervention.status === 'scheduled' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1"
                  onClick={onStartWork}
                >
                  <Wrench size={16} />
                  <span>Démarrer</span>
                </Button>
              )}
              <DialogClose asChild>
                <Button size="sm">Fermer</Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <DeleteInterventionAlert
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default InterventionDetailsDialog;
