
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tractor, Calendar, ScrollText, Package, Search as SearchIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/use-debounce';

// Types for search results
type SearchResultType = 'equipment' | 'maintenance' | 'intervention' | 'part';

interface SearchResult {
  id: number | string;
  title: string;
  description: string;
  type: SearchResultType;
  url: string;
  tags?: string[];
  status?: string;
}

// Sample search data - in a real app, this would come from an API
const sampleSearchResults: SearchResult[] = [
  {
    id: 1,
    title: "Tracteur John Deere 6120M",
    description: "Tracteur polyvalent pour travaux agricoles",
    type: "equipment",
    url: "/equipment/1",
    tags: ["tracteur", "john deere"],
    status: "operational"
  },
  {
    id: 2,
    title: "Vidange moteur",
    description: "Maintenance planifiée pour Tracteur John Deere",
    type: "maintenance",
    url: "/maintenance?taskId=2",
    status: "upcoming"
  },
  {
    id: 3,
    title: "Réparation hydraulique",
    description: "Intervention sur système hydraulique du tracteur",
    type: "intervention",
    url: "/interventions?id=3",
    status: "in-progress"
  },
  {
    id: 4,
    title: "Filtre à huile",
    description: "Filtre pour moteur diesel",
    type: "part",
    url: "/parts?id=4",
    status: "in-stock"
  },
  {
    id: 5,
    title: "Moissonneuse Claas Lexion 8900",
    description: "Moissonneuse-batteuse haute performance",
    type: "equipment",
    url: "/equipment/5",
    tags: ["moissonneuse", "claas"],
    status: "maintenance"
  }
];

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    // Simulate a search API call
    if (debouncedQuery) {
      const filteredResults = sampleSearchResults.filter(item => {
        const matchesQuery = 
          item.title.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
          item.description.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          item.tags?.some(tag => tag.toLowerCase().includes(debouncedQuery.toLowerCase()));
        
        const matchesTab = activeTab === 'all' || item.type === activeTab;
        
        return matchesQuery && matchesTab;
      });
      
      setResults(filteredResults);
    } else {
      setResults(activeTab === 'all' ? sampleSearchResults : sampleSearchResults.filter(item => item.type === activeTab));
    }
  }, [debouncedQuery, activeTab]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
  };

  const getStatusBadge = (result: SearchResult) => {
    switch (result.type) {
      case 'equipment':
        if (result.status === 'operational') return <Badge variant="success">Opérationnel</Badge>;
        if (result.status === 'maintenance') return <Badge variant="warning">En maintenance</Badge>;
        return <Badge>Inconnu</Badge>;
      
      case 'maintenance':
        if (result.status === 'upcoming') return <Badge>À venir</Badge>;
        if (result.status === 'overdue') return <Badge variant="destructive">En retard</Badge>;
        return <Badge variant="outline">Planifié</Badge>;
      
      case 'intervention':
        if (result.status === 'in-progress') return <Badge variant="warning">En cours</Badge>;
        if (result.status === 'completed') return <Badge variant="success">Terminé</Badge>;
        return <Badge>Planifié</Badge>;
      
      case 'part':
        if (result.status === 'in-stock') return <Badge variant="outline">En stock</Badge>;
        if (result.status === 'low-stock') return <Badge variant="warning">Stock bas</Badge>;
        return <Badge variant="destructive">Rupture</Badge>;
      
      default:
        return null;
    }
  };

  const getIcon = (type: SearchResultType) => {
    switch (type) {
      case 'equipment': return <Tractor className="h-5 w-5" />;
      case 'maintenance': return <Calendar className="h-5 w-5" />;
      case 'intervention': return <ScrollText className="h-5 w-5" />;
      case 'part': return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="container max-w-4xl py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher des équipements, maintenances, interventions..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <Button variant="outline" onClick={() => setQuery('')}>
          Effacer
        </Button>
      </div>

      <Tabs value={activeTab || 'all'} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="all" className="text-center">Tout</TabsTrigger>
          <TabsTrigger value="equipment" className="text-center">Équipements</TabsTrigger>
          <TabsTrigger value="maintenance" className="text-center">Maintenance</TabsTrigger>
          <TabsTrigger value="intervention" className="text-center">Interventions</TabsTrigger>
          <TabsTrigger value="part" className="text-center">Pièces</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab || 'all'} className="space-y-4">
          {results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-muted p-3">
                  <SearchIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-3 text-lg font-medium">Aucun résultat</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Essayez de modifier vos termes de recherche ou de changer de catégorie
                </p>
              </CardContent>
            </Card>
          ) : (
            results.map(result => (
              <Card 
                key={`${result.type}-${result.id}`}
                className="cursor-pointer hover:bg-accent/5 transition-colors"
                onClick={() => handleResultClick(result)}
              >
                <CardHeader className="flex flex-row items-start justify-between p-4">
                  <div className="flex gap-3">
                    <div className="mt-1 rounded-md bg-primary/10 p-2">
                      {getIcon(result.type)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{result.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">{result.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result)}
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {result.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {result.type === 'equipment' && 'Équipement'}
                      {result.type === 'maintenance' && 'Maintenance'}
                      {result.type === 'intervention' && 'Intervention'}
                      {result.type === 'part' && 'Pièce'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Search;
