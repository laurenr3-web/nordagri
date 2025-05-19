
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Intervention } from '@/types/Intervention';

interface DateFieldProps {
  date: Date | undefined;
  setDate: (date: Date) => void;
  intervention?: Intervention;
  handleInterventionUpdate: (intervention: Intervention) => void;
}

const DateField: React.FC<DateFieldProps> = ({
  date,
  setDate,
  intervention,
  handleInterventionUpdate
}) => {
  const handleDateChange = (date: Date) => {
    setDate(date);
    if (intervention && date) {
      const updatedIntervention = {
        ...intervention,
        date: date // It will be properly converted when sent to the API
      };
      handleInterventionUpdate(updatedIntervention);
    }
  };
  
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="date" className="text-right">
        Date
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "col-span-3 justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Choisir une date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(value) => value && handleDateChange(value)}
            disabled={(date) =>
              date > new Date()
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateField;
