
import React from 'react';
import { formatDate } from '../../utils/interventionUtils';
import { Intervention } from '@/types/Intervention';
import PriorityBadge from '../../PriorityBadge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle2, X } from 'lucide-react';

interface RequestCardProps {
  request: Intervention;
  onViewDetails: (intervention: Intervention) => void;
  onAccept: (intervention: Intervention) => void;
  onReject: (intervention: Intervention) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ 
  request, 
  onViewDetails, 
  onAccept, 
  onReject 
}) => {
  return (
    <Card className="hover:shadow-md transition-all">
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
          onClick={() => onAccept(request)}
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Accepter
        </Button>
        <Button 
          size="sm"
          variant="destructive"
          className="ml-2 text-xs"
          onClick={() => onReject(request)}
        >
          <X className="mr-1 h-3 w-3" />
          Rejeter
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RequestCard;
