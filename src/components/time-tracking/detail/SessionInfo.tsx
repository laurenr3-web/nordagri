
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { MapPin, Wrench, User, Clock } from 'lucide-react';

interface SessionInfoProps {
  userName: string;
  userAvatar?: string;
  taskType: string;
  equipmentId?: number;
  equipmentName?: string;
  location?: string;
}

export const SessionInfo = ({
  userName,
  userAvatar,
  taskType,
  equipmentId,
  equipmentName,
  location
}: SessionInfoProps) => {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={userAvatar} />
            <AvatarFallback>{userName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium">{userName}</h4>
            <p className="text-sm text-muted-foreground">Employé</p>
          </div>
        </div>
        
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{taskType}</span>
          </div>
          
          {equipmentId && equipmentName && (
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <Link 
                to={`/equipment/${equipmentId}`}
                className="text-primary hover:underline"
              >
                {equipmentName}
              </Link>
            </div>
          )}
          
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{location}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
