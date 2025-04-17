
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTimeTrackingData } from '@/hooks/time-tracking/useTimeTrackingData';

type PeriodType = 'weekly' | 'biweekly' | 'triweekly' | 'monthly' | 'custom';

interface PayrollPeriodProps {
  className?: string;
}

export function PayrollPeriod({ className }: PayrollPeriodProps) {
  const [periodType, setPeriodType] = useState<PeriodType>('weekly');
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  });

  const { stats } = useTimeTrackingData();

  const getPeriodDates = useCallback((type: PeriodType) => {
    const today = new Date();
    const start = startOfDay(today);
    
    switch (type) {
      case 'weekly':
        return { from: start, to: endOfDay(addDays(start, 7)) };
      case 'biweekly':
        return { from: start, to: endOfDay(addDays(start, 14)) };
      case 'triweekly':
        return { from: start, to: endOfDay(addDays(start, 21)) };
      case 'monthly':
        return { from: start, to: endOfDay(addDays(start, 30)) };
      case 'custom':
        return customDateRange;
      default:
        return { from: start, to: endOfDay(addDays(start, 7)) };
    }
  }, [customDateRange]);

  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriodType(newPeriod);
    if (newPeriod !== 'custom') {
      const newDates = getPeriodDates(newPeriod);
      setCustomDateRange(newDates);
    }
  };

  const currentPeriod = getPeriodDates(periodType);
  const hoursInPeriod = stats?.totalWeek || 0; // À adapter avec les nouvelles données de période

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between items-center">
          <span>Période de paie</span>
          <Select value={periodType} onValueChange={(value: PeriodType) => handlePeriodChange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionner la période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Hebdomadaire</SelectItem>
              <SelectItem value="biweekly">Bi-hebdomadaire</SelectItem>
              <SelectItem value="triweekly">Toutes les 3 semaines</SelectItem>
              <SelectItem value="monthly">Mensuel</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {periodType === 'custom' && (
          <div className="mb-4">
            <DateRangePicker
              value={customDateRange}
              onChange={(range) => {
                if (range?.from && range?.to) {
                  setCustomDateRange({
                    from: startOfDay(range.from),
                    to: endOfDay(range.to)
                  });
                }
              }}
            />
          </div>
        )}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Heures totales</p>
            <p className="text-lg font-medium">{hoursInPeriod.toFixed(1)} heures</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
