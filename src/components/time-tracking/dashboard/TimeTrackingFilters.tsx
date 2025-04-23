
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { startOfWeek, endOfWeek } from 'date-fns';

interface TimeTrackingFiltersProps {
  dateRange: { from: Date; to: Date };
  equipmentFilter?: number;
  taskTypeFilter?: string;
  equipments: { id: number; name: string }[];
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
  onEquipmentChange: (value: number | undefined) => void;
  onTaskTypeChange: (value: string | undefined) => void;
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
  onReset,
}: TimeTrackingFiltersProps) {
  return (
    <div className="bg-gray-50 p-3 sm:p-4 rounded-md mb-6 overflow-hidden">
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Période
          </label>
          <DateRangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            className="w-full"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Équipement
            </label>
            <Select
              value={equipmentFilter?.toString() || "all"}
              onValueChange={(value) => onEquipmentChange(value !== "all" ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {equipments.map((equipment) => (
                  <SelectItem key={equipment.id} value={equipment.id.toString()}>
                    {equipment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de tâche
            </label>
            <Select
              value={taskTypeFilter || "all"}
              onValueChange={(value) => onTaskTypeChange(value !== "all" ? value : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="repair">Réparation</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" onClick={onReset} className="w-full sm:w-auto sm:min-h-[44px]">
            Réinitialiser
          </Button>
        </div>
      </div>
    </div>
  );
}
