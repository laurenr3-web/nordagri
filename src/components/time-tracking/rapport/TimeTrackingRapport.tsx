
import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { addMonths, subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Header from './Header';
import MonthSelector from './MonthSelector';
import PayPeriodSummary from './PayPeriodSummary';
import HoursSummary from './HoursSummary';

// Mock data
const mockSummary = {
  today: 4.5,
  week: 28,
  month: 120,
  todayPercentage: 56,
  weekPercentage: 78,
  monthPercentage: 92
};

const TimeTrackingRapport: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleExport = useCallback((type: 'pdf' | 'excel') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      console.log(`Export as ${type}`);
    }, 1500);
  }, []);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  }, []);
  
  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  }, []);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const formattedPeriod = format(monthStart, 'MMMM yyyy', { locale: fr });
  
  return (
    <div className="space-y-6 overflow-x-hidden">
      <Header isExporting={isExporting} onExport={handleExport} />
      
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">Rapport de Travail</h2>
              <p className="text-sm text-muted-foreground">
                Période: {formattedPeriod}
              </p>
            </div>
            <div className="w-full md:w-1/3">
              <MonthSelector 
                currentMonth={currentMonth}
                onPrevious={handlePrevMonth}
                onNext={handleNextMonth}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <HoursSummary summary={mockSummary} />
            </div>
            <div>
              <PayPeriodSummary isLoading={false} monthly={120} biWeekly={60} />
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm">Exporté le {format(new Date(), 'PP', { locale: fr })}</p>
              <Button size="sm" variant="outline" className="min-h-[44px] sm:min-h-0" onClick={() => handleExport('pdf')}>
                Télécharger PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackingRapport;
