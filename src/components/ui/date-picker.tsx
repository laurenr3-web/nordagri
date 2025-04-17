
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | undefined;
  onSelect?: (date: Date | Date[] | undefined) => void;
  showMonthYearPicker?: boolean;
  dateFormat?: string;
  locale?: Locale;
  captionLayout?: "dropdown" | "dropdown-buttons" | "buttons";
}

export function DatePicker({
  mode = "single",
  selected,
  onSelect,
  showMonthYearPicker = false,
  dateFormat = "dd MMM yyyy",
  locale = fr,
  captionLayout
}: DatePickerProps) {
  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected instanceof Date ? (
              format(selected, dateFormat, { locale })
            ) : Array.isArray(selected) && selected.length > 0 ? (
              format(selected[0], dateFormat, { locale })
            ) : (
              <span>Sélectionner une date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode={mode}
            selected={selected}
            onSelect={onSelect}
            captionLayout={captionLayout}
            initialFocus
            locale={locale}
            showMonthYearPicker={showMonthYearPicker}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
