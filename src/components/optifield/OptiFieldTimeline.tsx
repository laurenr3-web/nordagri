
import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Tractor } from 'lucide-react';

interface TimelineEvent {
  id: string;
  time: string;
  description: string;
  equipment: string;
  location: string;
  type: 'start' | 'stop' | 'enter' | 'exit' | 'pause';
}

const MOCK_TIMELINE: TimelineEvent[] = [
  { 
    id: '1',
    time: '08:15',
    description: 'Début du labour',
    equipment: 'Tracteur John Deere 6250R avec Charrue Kverneland',
    location: 'Les Grandes Terres',
    type: 'start'
  },
  { 
    id: '2',
    time: '09:30',
    description: 'Entrée dans nouvelle parcelle',
    equipment: 'Tracteur John Deere 6250R avec Charrue Kverneland',
    location: 'Parcelle Nord',
    type: 'enter'
  },
  { 
    id: '3',
    time: '10:45',
    description: 'Pause technique',
    equipment: 'Tracteur John Deere 6250R avec Charrue Kverneland',
    location: 'Parcelle Nord',
    type: 'pause'
  },
  { 
    id: '4',
    time: '11:00',
    description: 'Reprise du travail',
    equipment: 'Tracteur John Deere 6250R avec Charrue Kverneland',
    location: 'Parcelle Nord',
    type: 'start'
  },
  { 
    id: '5',
    time: '12:30',
    description: 'Fin de session',
    equipment: 'Tracteur John Deere 6250R avec Charrue Kverneland',
    location: 'Parcelle Nord',
    type: 'stop'
  },
];

const getTimelineItemColor = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'start': return 'bg-green-500';
    case 'stop': return 'bg-red-500';
    case 'enter': return 'bg-blue-500';
    case 'exit': return 'bg-amber-500';
    case 'pause': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

const TimelineItem: React.FC<{ event: TimelineEvent; isLast: boolean }> = ({ event, isLast }) => {
  return (
    <div className="relative pb-8">
      {!isLast && (
        <div className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
      )}
      <div className="relative flex items-start space-x-3">
        <div className="relative">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getTimelineItemColor(event.type)} text-white`}>
            {event.type === 'start' && <Play className="h-5 w-5" />}
            {event.type === 'stop' && <Square className="h-5 w-5" />}
            {event.type === 'enter' && <LogIn className="h-5 w-5" />}
            {event.type === 'exit' && <LogOut className="h-5 w-5" />}
            {event.type === 'pause' && <Pause className="h-5 w-5" />}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {event.description}
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {event.time}
            </p>
          </div>
          <div className="mt-2 text-sm text-gray-700">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Tractor className="h-3 w-3" />
              <span>{event.equipment}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OptiFieldTimeline: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Historique des activités</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Aujourd'hui</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>08:00 - 17:00</span>
          </div>
        </div>
      </div>
      
      <Card className="p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {MOCK_TIMELINE.map((event, eventIdx) => (
              <li key={event.id}>
                <TimelineItem 
                  event={event} 
                  isLast={eventIdx === MOCK_TIMELINE.length - 1} 
                />
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
};

import { Play, Square, LogIn, LogOut, Pause } from 'lucide-react';

export default OptiFieldTimeline;
