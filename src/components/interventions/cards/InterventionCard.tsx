
import React from 'react';
import { Intervention } from '@/types/Intervention';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, FileText, Wrench, Download, User } from 'lucide-react';
import { formatDate } from '../utils/interventionUtils';
import { exportInterventionToPDF } from '@/utils/pdf-export/intervention-report';
import { toast } from 'sonner';
import { useOfflineStatus } from '@/providers/OfflineProvider';
import StatusBadge from '../StatusBadge';
import PriorityBadge from '../PriorityBadge';

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
  const { isOnline } = useOfflineStatus();
  const isPendingSync = intervention.id < 0;

  // Determine border color based on priority
  const getPriorityBorderClass = () => {
    switch(intervention.priority) {
      case 'high':
        return 'border-l-4 border-l-red-500';
      case 'medium':
        return 'border-l-4 border-l-orange-500';
      default:
        return 'border-l-4 border-l-green-500';
    }
  };
  
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
      className={`w-full overflow-hidden transition-all hover:shadow-md animate-fade-in ${getPriorityBorderClass()} ${isPendingSync ? 'bg-orange-50' : ''}`}
      onClick={() => onViewDetails(intervention)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-base leading-tight break-words">
              {intervention.title}
            </h3>
            <div className="flex flex-wrap gap-1">
              <StatusBadge status={intervention.status} />
              <PriorityBadge priority={intervention.priority} />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Wrench size={16} className="text-blue-600 flex-shrink-0" />
            <span className="font-medium break-words line-clamp-1">{intervention.equipment}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={14} className="flex-shrink-0" />
              <span className="whitespace-nowrap">{formatDate(intervention.date)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={14} className="flex-shrink-0" />
              <span className="whitespace-nowrap">
                {intervention.status === 'completed' && intervention.duration
                  ? `${intervention.duration} hrs`
                  : `${intervention.scheduledDuration} hrs`}
              </span>
            </div>
          </div>
          
          {intervention.description && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground line-clamp-2 italic">{intervention.description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InterventionCard;
