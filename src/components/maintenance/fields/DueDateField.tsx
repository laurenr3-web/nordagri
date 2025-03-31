
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import FormFieldGroup from './FormFieldGroup';

interface DueDateFieldProps {
  dueDate: Date;
  setDueDate: (date: Date) => void;
}

const DueDateField: React.FC<DueDateFieldProps> = ({ dueDate, setDueDate }) => {
  return (
    <FormFieldGroup>
      <Label htmlFor="dueDate">Date d'échéance</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dueDate ? format(dueDate, 'PPP', { locale: fr }) : <span>Sélectionner une date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dueDate}
            onSelect={(date) => date && setDueDate(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </FormFieldGroup>
  );
};

export default DueDateField;
