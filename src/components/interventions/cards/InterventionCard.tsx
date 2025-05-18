
import React from 'react';
import { Intervention } from '@/types/Intervention';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, FileText, Wrench, Download } from 'lucide-react';
import { getStatusColor, getPriorityColor } from '../utils/interventionUtils';
import { formatDate } from '@/utils/dateHelpers';
import { exportInterventionToPDF } from '@/utils/pdf-export/intervention-report';
import { toast } from 'sonner';

interface InterventionCardProps {
  intervention: Intervention;
  onViewDetails: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
}

const InterventionCard: React.FC<InterventionCardProps> = ({
  intervention,
  onViewDetails,
  onStartWork
}) => {
  const statusColor = getStatusColor(intervention.status);
  const priorityColor = getPriorityColor(intervention.priority);
  
  const handleExportPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await exportInterventionToPDF(intervention);
      toast.success("Rapport d'intervention exporté avec succès");
    } catch (error) {
      console.error("Erreur lors de l'export du PDF:", error);
      toast.error("Une erreur s'est produite lors de l'export du rapport");
    }
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewDetails(intervention)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold truncate mr-2">{intervention.title}</h3>
          <div className="flex gap-1">
            <Badge variant="outline" className={`${priorityColor} text-xs`}>
              {intervention.priority === 'high' ? 'Élevée' : 
               intervention.priority === 'medium' ? 'Moyenne' : 'Basse'}
            </Badge>
            <Badge className={`${statusColor} text-xs`}>
              {intervention.status === 'scheduled' ? 'Planifiée' :
               intervention.status === 'in-progress' ? 'En cours' : 
               intervention.status === 'completed' ? 'Terminée' : 'Annulée'}
            </Badge>
          </div>
        </div>
        
        <div className="text-sm space-y-2 text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-2" />
            <span>{formatDate(intervention.date)}</span>
          </div>
          
          {intervention.scheduledDuration && (
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-2" />
              <span>{intervention.scheduledDuration}h</span>
            </div>
          )}
          
          <div className="flex items-center">
            <FileText className="h-3.5 w-3.5 mr-2" />
            <span className="truncate">{intervention.equipment}</span>
          </div>
          
          {intervention.location && (
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-2" />
              <span className="truncate">{intervention.location}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-2 bg-muted/40 flex justify-between border-t">
        {intervention.status === 'scheduled' && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onStartWork(intervention);
            }}
          >
            <Wrench className="h-3.5 w-3.5 mr-1" />
            Démarrer
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="text-xs ml-auto"
          onClick={handleExportPDF}
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          PDF
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterventionCard;
