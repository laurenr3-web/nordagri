
import * as React from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem, CommandEmpty, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type Option = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Sélectionner...",
  emptyMessage = "Aucun résultat trouvé.",
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Ensure options is always an array, even if undefined is passed
  const safeOptions = options || [];

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return safeOptions;
    
    return safeOptions.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, safeOptions]);

  // Get all labels for selected options
  const selectedLabels = React.useMemo(() => 
    selected
      .map(value => safeOptions.find(option => option.value === value))
      .filter(Boolean)
      .map(option => option?.label || ""),
    [selected, safeOptions]
  );

  // Handle removing a selected item
  const handleRemove = (selectedValue: string) => {
    onChange(selected.filter(value => value !== selectedValue));
  };

  // Handle selecting/deselecting an option
  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  console.log('MultiSelect rendering with:', { options: safeOptions, selected, filteredOptions });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            disabled && "cursor-not-allowed opacity-50",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            className
          )}
          onClick={() => !disabled && setOpen(!open)}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map(value => {
                const option = safeOptions.find(opt => opt.value === value);
                return (
                  <Badge 
                    key={value}
                    variant="secondary" 
                    className="mr-1 mb-1 gap-1 px-2 py-0"
                  >
                    {option?.label || value}
                    {!disabled && (
                      <button
                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(value);
                        }}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        <span className="sr-only">Supprimer {option?.label}</span>
                      </button>
                    )}
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <input
              placeholder="Rechercher un équipement..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {filteredOptions && filteredOptions.length > 0 ? (
            <CommandList>
              <CommandGroup>
                {filteredOptions.map(option => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        handleSelect(option.value);
                        // Ne pas fermer le menu pour permettre des sélections multiples
                      }}
                      className="cursor-pointer"
                    >
                      <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                      )}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
