
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';

interface SearchItem {
  id: string | number;
  title: string;
  type: 'equipment' | 'part' | 'intervention' | 'maintenance' | 'task';
  subtitle?: string;
  url: string;
}

interface SearchBarProps {
  searchItems: SearchItem[];
  placeholder?: string;
  className?: string;
}

export function SearchBar({ searchItems, placeholder = "Recherche globale...", className }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <BlurContainer
        className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${className}`}
        intensity="light"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">{placeholder}</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </BlurContainer>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          <CommandGroup heading="Équipements">
            {searchItems
              .filter(item => item.type === 'equipment')
              .map(item => (
                <CommandItem
                  key={`${item.type}-${item.id}`}
                  onSelect={() => {
                    navigate(item.url);
                    setOpen(false);
                  }}
                >
                  <span>{item.title}</span>
                  {item.subtitle && <span className="text-muted-foreground text-xs ml-2">- {item.subtitle}</span>}
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandGroup heading="Pièces détachées">
            {searchItems
              .filter(item => item.type === 'part')
              .map(item => (
                <CommandItem
                  key={`${item.type}-${item.id}`}
                  onSelect={() => {
                    navigate(item.url);
                    setOpen(false);
                  }}
                >
                  <span>{item.title}</span>
                  {item.subtitle && <span className="text-muted-foreground text-xs ml-2">- {item.subtitle}</span>}
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandGroup heading="Interventions">
            {searchItems
              .filter(item => item.type === 'intervention')
              .map(item => (
                <CommandItem
                  key={`${item.type}-${item.id}`}
                  onSelect={() => {
                    navigate(item.url);
                    setOpen(false);
                  }}
                >
                  <span>{item.title}</span>
                  {item.subtitle && <span className="text-muted-foreground text-xs ml-2">- {item.subtitle}</span>}
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandGroup heading="Maintenance">
            {searchItems
              .filter(item => item.type === 'maintenance' || item.type === 'task')
              .map(item => (
                <CommandItem
                  key={`${item.type}-${item.id}`}
                  onSelect={() => {
                    navigate(item.url);
                    setOpen(false);
                  }}
                >
                  <span>{item.title}</span>
                  {item.subtitle && <span className="text-muted-foreground text-xs ml-2">- {item.subtitle}</span>}
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
