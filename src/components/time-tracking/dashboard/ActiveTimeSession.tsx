
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { ActiveTimeEntry } from '@/hooks/time-tracking/types';
import { useNavigate } from 'react-router-dom';

interface ActiveTimeSessionProps {
  session: ActiveTimeEntry;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onStop: (id: string) => void;
}

export function ActiveTimeSession({ 
  session, 
  onPause, 
  onResume, 
  onStop 
}: ActiveTimeSessionProps) {
  const navigate = useNavigate();
  
  const handleStop = () => {
    // Redirection au lieu de clôture directe
    navigate(`/time-tracking/detail/${session.id}`);
  };
  
  return (
    <Card className="mb-6 bg-blue-50 border-blue-200">
      <CardContent className="pt-6 px-3 sm:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 md:h-10 md:w-10 text-blue-500 flex-shrink-0" />
            <div>
              <div className="text-sm text-blue-700 truncate max-w-[200px]">
                {session.user_name || session.owner_name || 'Non assigné'}
              </div>
              <div className="text-2xl md:text-3xl font-mono font-bold text-blue-900">
                {session.current_duration || "00:00:00"}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="text-sm text-blue-700 truncate max-w-full">
              {session.task_type === 'other' 
                ? session.custom_task_type 
                : session.task_type} {session.equipment_name ? `- ${session.equipment_name}` : ''}
            </div>
            <div className="text-sm text-blue-700 truncate max-w-full">
              {session.location || 'Aucun emplacement'}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="mr-2 text-blue-700">
              {session.status === 'active' ? 'En cours' : 'En pause'}
            </span>
            {session.status === 'active' ? (
              <Button
                onClick={() => onPause(session.id)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Pause
              </Button>
            ) : (
              <Button
                onClick={() => onResume(session.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                Reprendre
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleStop}
              title="Aller à la page de clôture"
            >
              Terminer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
