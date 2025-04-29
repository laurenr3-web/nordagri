
import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BlurContainer } from '@/components/ui/blur-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Intervention } from '@/types/Intervention';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, MapPin, User, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import AssignTechnicianDialog from '../dialogs/AssignTechnicianDialog';

interface FieldTrackingViewProps {
  interventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
  onUpdateStatus?: (interventionId: number, newStatus: string) => void;
  onAssignTechnician?: (intervention: Intervention, technician: string) => void;
}

const FieldTrackingView: React.FC<FieldTrackingViewProps> = ({ 
  interventions, 
  onViewDetails,
  onUpdateStatus,
  onAssignTechnician
}) => {
  const [activeTab, setActiveTab] = useState('in-progress');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  
  // Filtrer les interventions selon l'onglet actif
  const filteredInterventions = interventions.filter(intervention => {
    if (activeTab === 'in-progress') return intervention.status === 'in-progress';
    if (activeTab === 'scheduled') return intervention.status === 'scheduled';
    return intervention.status === 'completed';
  });
  
  // Obtenir les initiales pour l'avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Gérer l'assignation d'un technicien
  const handleAssignTechnician = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setAssignDialogOpen(true);
  };
  
  // Soumettre l'assignation
  const handleAssignSubmit = (technician: string) => {
    if (selectedIntervention && onAssignTechnician) {
      onAssignTechnician(selectedIntervention, technician);
      setAssignDialogOpen(false);
      setSelectedIntervention(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Suivi des interventions terrain</CardTitle>
          <CardDescription>Visualisez et gérez les interventions en cours, planifiées et terminées</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="scheduled">
                Planifiées ({interventions.filter(i => i.status === 'scheduled').length})
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                En cours ({interventions.filter(i => i.status === 'in-progress').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Terminées ({interventions.filter(i => i.status === 'completed').length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="scheduled" className="space-y-4">
              {filteredInterventions.length > 0 ? (
                filteredInterventions.map(intervention => (
                  <BlurContainer 
                    key={intervention.id} 
                    className="p-4"
                    raised
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-start gap-2 mb-2">
                          <Badge 
                            variant={
                              intervention.priority === 'high' ? 'destructive' : 
                              intervention.priority === 'medium' ? 'default' : 'outline'
                            }
                          >
                            {intervention.priority === 'high' ? 'Haute' : 
                             intervention.priority === 'medium' ? 'Moyenne' : 'Basse'}
                          </Badge>
                          <h3 className="font-semibold">{intervention.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{intervention.equipment}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">
                              {format(intervention.date, 'dd MMMM yyyy HH:mm', { locale: fr })}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{intervention.location}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">
                              {intervention.technician || 'Non assigné'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {!intervention.technician && onAssignTechnician && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAssignTechnician(intervention)}
                          >
                            Assigner
                          </Button>
                        )}
                        
                        {onUpdateStatus && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => onUpdateStatus(intervention.id, 'in-progress')}
                          >
                            Démarrer
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onViewDetails(intervention)}
                        >
                          Détails
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </BlurContainer>
                ))
              ) : (
                <BlurContainer className="p-4 text-center text-muted-foreground">
                  Aucune intervention planifiée pour le moment.
                </BlurContainer>
              )}
            </TabsContent>
            
            <TabsContent value="in-progress" className="space-y-4">
              {filteredInterventions.length > 0 ? (
                filteredInterventions.map(intervention => (
                  <BlurContainer 
                    key={intervention.id} 
                    className="p-4"
                    raised
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-start gap-2 mb-2">
                          <Badge 
                            variant={
                              intervention.priority === 'high' ? 'destructive' : 
                              intervention.priority === 'medium' ? 'default' : 'outline'
                            }
                          >
                            {intervention.priority === 'high' ? 'Haute' : 
                             intervention.priority === 'medium' ? 'Moyenne' : 'Basse'}
                          </Badge>
                          <h3 className="font-semibold">{intervention.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{intervention.equipment}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">
                              {format(intervention.date, 'dd MMMM yyyy HH:mm', { locale: fr })}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{intervention.location}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback className="text-xs">
                                {intervention.technician ? getInitials(intervention.technician) : 'NA'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {intervention.technician || 'Non assigné'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {onUpdateStatus && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => onUpdateStatus(intervention.id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Terminer
                          </Button>
                        )}
                        
                        {onUpdateStatus && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onUpdateStatus(intervention.id, 'canceled')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Annuler
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onViewDetails(intervention)}
                        >
                          Détails
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </BlurContainer>
                ))
              ) : (
                <BlurContainer className="p-4 text-center text-muted-foreground">
                  Aucune intervention en cours pour le moment.
                </BlurContainer>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {filteredInterventions.length > 0 ? (
                filteredInterventions.map(intervention => (
                  <BlurContainer 
                    key={intervention.id} 
                    className="p-4"
                    raised
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-start gap-2 mb-2">
                          <Badge variant="secondary">Terminée</Badge>
                          <h3 className="font-semibold">{intervention.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{intervention.equipment}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">
                              {format(intervention.date, 'dd MMMM yyyy', { locale: fr })}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">
                              {intervention.technician || 'Non assigné'}
                            </span>
                          </div>
                          
                          {intervention.duration && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">
                                Durée: {intervention.duration} h
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewDetails(intervention)}
                      >
                        Rapport
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </BlurContainer>
                ))
              ) : (
                <BlurContainer className="p-4 text-center text-muted-foreground">
                  Aucune intervention terminée pour le moment.
                </BlurContainer>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <AssignTechnicianDialog 
        open={assignDialogOpen} 
        onOpenChange={setAssignDialogOpen}
        onSubmit={handleAssignSubmit}
        intervention={selectedIntervention}
      />
    </>
  );
};

export default FieldTrackingView;
