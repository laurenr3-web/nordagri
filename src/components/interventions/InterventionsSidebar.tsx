import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Calendar } from "lucide-react"
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDate } from './utils/interventionUtils';
import { Intervention } from '@/types/Intervention';

interface InterventionsSidebarProps {
  interventions: Intervention[];
  selectedIntervention: Intervention | null;
  onSelectIntervention: (intervention: Intervention) => void;
}

const InterventionsSidebar: React.FC<InterventionsSidebarProps> = ({
  interventions,
  selectedIntervention,
  onSelectIntervention,
}) => {
  const [filter, setFilter] = useState('all');
  const [filteredInterventions, setFilteredInterventions] = useState<Intervention[]>([]);

  useEffect(() => {
    setFilteredInterventions(sortAndFilterInterventions(interventions, filter));
  }, [interventions, filter]);

  // Update the filtering functions to handle string or Date types correctly
  const sortAndFilterInterventions = (interventions: Intervention[], filter: string) => {
    return interventions
      .filter((intervention) => {
        switch (filter) {
          case 'all':
            return true;
          case 'in-progress':
            return intervention.status === 'in-progress';
          case 'scheduled':
            return intervention.status === 'scheduled';
          case 'completed':
            return intervention.status === 'completed';
          case 'canceled':
            return intervention.status === 'canceled';
          default:
            return true;
        }
      })
      .sort((a, b) => {
        // Convert dates to timestamps for comparison
        const dateA = typeof a.date === 'string' ? new Date(a.date).getTime() : a.date.getTime();
        const dateB = typeof b.date === 'string' ? new Date(b.date).getTime() : b.date.getTime();
        return dateB - dateA;
      });
  };

  return (
    <div className="w-full py-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters">
          <AccordionTrigger>Filtres</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-2 mt-2">
              <Button
                variant={filter === 'all' ? 'secondary' : 'outline'}
                onClick={() => setFilter('all')}
              >
                Toutes
              </Button>
              <Button
                variant={filter === 'in-progress' ? 'secondary' : 'outline'}
                onClick={() => setFilter('in-progress')}
              >
                En cours
              </Button>
              <Button
                variant={filter === 'scheduled' ? 'secondary' : 'outline'}
                onClick={() => setFilter('scheduled')}
              >
                Planifiées
              </Button>
              <Button
                variant={filter === 'completed' ? 'secondary' : 'outline'}
                onClick={() => setFilter('completed')}
              >
                Terminées
              </Button>
              <Button
                variant={filter === 'canceled' ? 'secondary' : 'outline'}
                onClick={() => setFilter('canceled')}
              >
                Annulées
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="interventions">
          <AccordionTrigger>Interventions</AccordionTrigger>
          <AccordionContent className="py-2">
            <div className="grid gap-2">
              {filteredInterventions.map((intervention) => (
                <Button
                  key={intervention.id}
                  variant={selectedIntervention?.id === intervention.id ? 'secondary' : 'ghost'}
                  className={cn(
                    "justify-start text-left",
                    selectedIntervention?.id === intervention.id ? 'font-semibold' : 'font-normal'
                  )}
                  onClick={() => onSelectIntervention(intervention)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{intervention.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(intervention.date)}</span>
                  </div>
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default InterventionsSidebar;
