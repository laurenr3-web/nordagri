
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[] | undefined;
  placeholder?: string;
  emptyMessage?: string;
  onSelect: (value: string) => void;
  className?: string;
  defaultValue?: string;
}

export function Combobox({
  options,
  placeholder = "Sélectionner une option...",
  emptyMessage = "Aucun résultat trouvé",
  onSelect,
  className,
  defaultValue,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue || "")
  const [searchTerm, setSearchTerm] = React.useState("")

  // Always ensure options is an array
  const safeOptions = Array.isArray(options) ? options : [];
  
  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return safeOptions;
    return safeOptions.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
      option.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, safeOptions]);

  const handleSelect = (currentValue: string) => {
    if (currentValue === undefined) return; // Prevent selecting undefined values
    setValue(currentValue)
    setOpen(false)
    if (typeof onSelect === 'function') {
      onSelect(currentValue)
    }
  }

  // Safely find the selected label
  const selectedLabel = React.useMemo(() => {
    const option = safeOptions.find(option => option.value === value)
    return option ? option.label : value || placeholder
  }, [value, safeOptions, placeholder])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder={placeholder} 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          {filteredOptions && filteredOptions.length > 0 && (
            <CommandGroup className="max-h-60 overflow-y-auto">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
