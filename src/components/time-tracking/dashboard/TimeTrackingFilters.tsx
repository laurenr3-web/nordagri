
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
    <div className="bg-gray-50 p-3 sm:p-4 rounded-md mb-6">
      <div className="flex flex-col space-y-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Period
          </label>
          <DateRangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            className="w-full"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment
            </label>
            <Select
              value={equipmentFilter?.toString() || "all"}
              onValueChange={(value) => onEquipmentChange(value !== "all" ? parseInt(value) : undefined)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
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
              Task Type
            </label>
            <Select
              value={taskTypeFilter || "all"}
              onValueChange={(value) => onTaskTypeChange(value !== "all" ? value : undefined)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-center sm:justify-start">
          <Button variant="outline" onClick={onReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
