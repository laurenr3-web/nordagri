
import React, { useCallback, useState } from 'react';
import { Search, XCircle, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { transitions, animations } from '@/lib/design-system';
import { useNavigate } from 'react-router-dom';

export type SearchItem = {
  id: string | number;
  title: string;
  subtitle?: string;
  type: 'equipment' | 'intervention' | 'part' | 'task';
  url: string;
};

interface SearchBarProps {
  searchItems: SearchItem[];
  className?: string;
  placeholder?: string;
}

export function SearchBar({ searchItems, className, placeholder = "Rechercher..." }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  // Simuler un délai de recherche pour une meilleure expérience utilisateur
  React.useEffect(() => {
    if (debouncedQuery.length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    setIsSearching(false);
  }, [debouncedQuery]);

  const filteredItems = React.useMemo(() => {
    if (!debouncedQuery) return [];
    
    const normalizedQuery = debouncedQuery.toLowerCase();
    
    return searchItems.filter(item => 
      item.title.toLowerCase().includes(normalizedQuery) || 
      (item.subtitle && item.subtitle.toLowerCase().includes(normalizedQuery))
    );
  }, [searchItems, debouncedQuery]);

  const handleSelect = useCallback((item: SearchItem) => {
    navigate(item.url);
    setOpen(false);
    setQuery('');
  }, [navigate]);

  const getTypeIcon = (type: SearchItem['type']) => {
    switch (type) {
      case 'equipment':
        return <div className="h-2 w-2 rounded-full bg-agri-primary" />;
      case 'intervention':
        return <div className="h-2 w-2 rounded-full bg-alert-orange" />;
      case 'part':
        return <div className="h-2 w-2 rounded-full bg-blue-500" />;
      case 'task':
        return <div className="h-2 w-2 rounded-full bg-alert-red" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: SearchItem['type']) => {
    switch (type) {
      case 'equipment':
        return 'Équipement';
      case 'intervention':
        return 'Intervention';
      case 'part':
        return 'Pièce';
      case 'task':
        return 'Tâche';
      default:
        return '';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-full justify-start text-sm text-muted-foreground",
            transitions.default,
            className
          )}
        >
          <Search className="mr-2 h-4 w-4" />
          {placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" sideOffset={8} alignOffset={8} side="bottom">
        <Command className="max-w-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher dans Agri ERP..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm border-none focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {query && (
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 rounded-md"
                onClick={() => setQuery('')}
              >
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
          {query.length > 0 && (
            <CommandList>
              {isSearching ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
                  <CommandGroup>
                    {filteredItems.map((item) => (
                      <CommandItem
                        key={`${item.type}-${item.id}`}
                        onSelect={() => handleSelect(item)}
                        className={cn(animations.fadeIn, "animate-delay-50")}
                      >
                        <div className="flex items-center">
                          <div className="mr-2">{getTypeIcon(item.type)}</div>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <span className="font-medium">{getTypeLabel(item.type)}</span>
                              {item.subtitle && (
                                <>
                                  <span>•</span>
                                  <span>{item.subtitle}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
