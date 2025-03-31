
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlurContainer } from '@/components/ui/blur-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Intervention } from '@/types/Intervention';
import { Badge } from '@/components/ui/badge';

interface CalendarViewProps {
  interventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
  onCreateIntervention?: (date?: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  interventions, 
  onViewDetails, 
  onCreateIntervention 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Navigation du calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  // Obtenir les jours du mois courant
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysList = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Obtenir le jour de la semaine du premier jour (0 = Dimanche, 1 = Lundi, etc.)
  const startDay = getDay(monthStart);
  
  // Grouper les interventions par date
  const interventionsByDate: { [date: string]: Intervention[] } = {};
  
  interventions.forEach(intervention => {
    const dateKey = format(intervention.date, 'yyyy-MM-dd');
    if (!interventionsByDate[dateKey]) {
      interventionsByDate[dateKey] = [];
    }
    interventionsByDate[dateKey].push(intervention);
  });
  
  // Obtenir les interventions pour un jour spécifique
  const getInterventionsForDay = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return interventionsByDate[dateKey] || [];
  };
  
  // Obtenir la couleur en fonction de la priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200';
    }
  };
  
  // Formater le jour du mois
  const formatDay = (day: number) => {
    return day;
  };
  
  // Afficher le nombre total d'interventions pour le mois
  const totalMonthInterventions = daysList.reduce((total, day) => {
    return total + getInterventionsForDay(day).length;
  }, 0);

  return (
    <Card className="col-span-1 xl:col-span-2">
      <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-lg font-medium">
          Calendrier des interventions
          <Badge className="ml-2" variant="outline">
            {totalMonthInterventions} intervention{totalMonthInterventions !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </span>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {onCreateIntervention && (
            <Button 
              variant="outline" 
              onClick={() => onCreateIntervention(new Date())}
              className="ml-2"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Nouvelle intervention
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 mb-2">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, i) => (
            <div key={i} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-2">
          {/* Cellules vides pour aligner le calendrier */}
          {Array.from({ length: startDay }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[100px]" />
          ))}
          
          {/* Jours du mois */}
          {daysList.map((day, index) => {
            const isCurrentDay = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const dayInterventions = getInterventionsForDay(day);
            
            return (
              <div
                key={index}
                className={`min-h-[100px] border rounded-md ${
                  isCurrentDay 
                    ? 'bg-primary-foreground border-primary'
                    : 'bg-card-foreground/5'
                } ${
                  isCurrentMonth 
                    ? '' 
                    : 'opacity-50'
                }`}
              >
                <div className="p-1 flex justify-between items-center">
                  <span className={`text-sm font-semibold ${isCurrentDay ? 'text-primary' : ''}`}>
                    {formatDay(day.getDate())}
                  </span>
                  {onCreateIntervention && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-50 hover:opacity-100"
                      onClick={() => onCreateIntervention(day)}
                    >
                      <PlusCircle className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {/* Liste des interventions du jour */}
                <ScrollArea className="h-[70px] px-1">
                  {dayInterventions.map((intervention, i) => (
                    <TooltipProvider key={i}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <BlurContainer
                            className={`p-1 text-xs mb-1 cursor-pointer truncate ${
                              getPriorityColor(intervention.priority)
                            }`}
                            onClick={() => onViewDetails(intervention)}
                          >
                            {intervention.title}
                          </BlurContainer>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-medium">{intervention.title}</p>
                            <p className="text-xs">{intervention.equipment}</p>
                            <p className="text-xs">
                              {format(intervention.date, 'HH:mm')} · {intervention.technician}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
