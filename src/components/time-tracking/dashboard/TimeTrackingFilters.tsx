import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface TimeTrackingFiltersProps {
  dateRange: DateRange | undefined;
  equipmentFilter: number | undefined;
  taskTypeFilter: string | undefined;
  equipments: { id: number; name: string }[];
  onDateRangeChange: (date: DateRange | undefined) => void;
  onEquipmentChange: (equipmentId: number | undefined) => void;
  onTaskTypeChange: (taskType: string | undefined) => void;
  onReset: () => void;
}

export function TimeTrackingFilters({
  dateRange,
  equipmentFilter,
  taskTypeFilter,
  equipments,
  onDateRangeChange,
  onEquipmentChange,
  onTaskTypeChange,
  onReset
}: TimeTrackingFiltersProps) {
  const [taskTypes, setTaskTypes] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const fetchTaskTypes = async () => {
      const { data } = await supabase
        .from('task_types')
        .select('id, name')
        .order('name');
      
      if (data) {
        setTaskTypes(data);
      }
    };
    
    fetchTaskTypes();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !dateRange?.from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                `${dateRange.from?.toLocaleDateString()} - ${dateRange.to?.toLocaleDateString()}`
              ) : (
                dateRange.from?.toLocaleDateString()
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from ? dateRange.from : new Date()}
            selected={dateRange}
            onSelect={onDateRangeChange}
            disabled={{ from: new Date(1900, 1, 1), to: new Date() }}
            numberOfMonths={2}
            pagedNavigation
          />
        </PopoverContent>
      </Popover>
      
      {/* Equipment Filter */}
      <Select value={equipmentFilter === undefined ? '' : equipmentFilter.toString()} onValueChange={(value) => onEquipmentChange(value === '' ? undefined : parseInt(value))}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Equipment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Equipments</SelectItem>
          {equipments.map((equipment) => (
            <SelectItem key={equipment.id} value={equipment.id.toString()}>{equipment.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Task Type Filter */}
      <Select value={taskTypeFilter || ''} onValueChange={onTaskTypeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Task Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Task Types</SelectItem>
          {taskTypes.map(type => (
            <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset Button */}
      <Button variant="secondary" className="w-full" onClick={onReset}>
        Reset Filters
      </Button>
    </div>
  );
}
