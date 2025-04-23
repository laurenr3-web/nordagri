
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type MonthSelectorProps = {
  currentMonth: Date;
  onPrevious: () => void;
  onNext: () => void;
};

const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonth,
  onPrevious,
  onNext,
}) => (
  <div className="flex flex-col sm:flex-row items-center justify-between bg-muted/50 rounded-md px-3 py-2 gap-2 sm:gap-0 w-full">
    <Button variant="ghost" size="sm" onClick={onPrevious} className="min-h-[44px]">
      <ChevronLeft className="h-4 w-4" />
    </Button>
    <div className="flex items-center">
      <Calendar className="h-4 w-4 mr-2" />
      <span className="font-medium text-base sm:text-lg">
        {format(currentMonth, 'MMMM yyyy', { locale: fr })}
      </span>
    </div>
    <Button variant="ghost" size="sm" onClick={onNext} className="min-h-[44px]">
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
);

export default MonthSelector;
