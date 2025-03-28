
import React, { useState } from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Intervention } from '@/types/Intervention';
import { formatDate } from '../utils/interventionUtils';
import { CheckCircle2, X, AlertTriangle, Clock, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import StatusBadge from '../StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EquipmentHistoryViewProps {
  interventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
}

const EquipmentHistoryView: React.FC<EquipmentHistoryViewProps> = ({ interventions, onViewDetails }) => {
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Get unique equipment names
  const uniqueEquipment = Array.from(new Set(interventions.map(i => i.equipment)));
  
  // Filter interventions by selected equipment and search term
  const filteredInterventions = interventions.filter(i => {
    const matchesEquipment = selectedEquipment ? i.equipment === selectedEquipment : true;
    const matchesSearch = searchTerm 
      ? i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesEquipment && matchesSearch;
  });

  // Calculate statistics for selected equipment
  const getEquipmentStats = () => {
    if (!selectedEquipment) return null;
    
    const equipmentInterventions = interventions.filter(i => i.equipment === selectedEquipment);
    const totalCount = equipmentInterventions.length;
    const completedCount = equipmentInterventions.filter(i => i.status === 'completed').length;
    const inProgressCount = equipmentInterventions.filter(i => i.status === 'in-progress').length;
    const scheduledCount = equipmentInterventions.filter(i => i.status === 'scheduled').length;
    const canceledCount = equipmentInterventions.filter(i => i.status === 'canceled').length;
    
    // Calculate total duration
    const totalDuration = equipmentInterventions
      .filter(i => i.status === 'completed' && i.duration)
      .reduce((sum, i) => sum + (i.duration || 0), 0);
    
    // Find earliest and latest interventions
    const sortedByDate = [...equipmentInterventions].sort((a, b) => a.date.getTime() - b.date.getTime());
    const earliestIntervention = sortedByDate.length > 0 ? sortedByDate[0] : null;
    const latestIntervention = sortedByDate.length > 0 ? sortedByDate[sortedByDate.length - 1] : null;
    
    return {
      totalCount,
      completedCount,
      inProgressCount,
      scheduledCount,
      canceledCount,
      totalDuration,
      earliestIntervention,
      latestIntervention
    };
  };
  
  const stats = getEquipmentStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="w-full md:w-1/3">
          <Select
            value={selectedEquipment}
            onValueChange={setSelectedEquipment}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un équipement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les équipements</SelectItem>
              {uniqueEquipment.map(equipment => (
                <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-2/3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par titre, technicien ou description..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {selectedEquipment && stats && (
        <BlurContainer className="p-5">
          <h3 className="font-medium text-lg mb-3">Statistiques pour {selectedEquipment}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-background/50">
              <CardContent className="p-4">
                <div className="text-xs uppercase text-muted-foreground">Total</div>
                <div className="text-2xl font-bold">{stats.totalCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-background/50">
              <CardContent className="p-4">
                <div className="text-xs uppercase text-muted-foreground">Complétées</div>
                <div className="text-2xl font-bold text-green-600">{stats.completedCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-background/50">
              <CardContent className="p-4">
                <div className="text-xs uppercase text-muted-foreground">En cours</div>
                <div className="text-2xl font-bold text-blue-600">{stats.inProgressCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-background/50">
              <CardContent className="p-4">
                <div className="text-xs uppercase text-muted-foreground">Durée totale</div>
                <div className="text-2xl font-bold">{stats.totalDuration} h</div>
              </CardContent>
            </Card>
          </div>
          
          {stats.earliestIntervention && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Première intervention: </span>
                <span className="font-medium">{formatDate(stats.earliestIntervention.date)}</span>
              </div>
              {stats.latestIntervention && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Dernière intervention: </span>
                  <span className="font-medium">{formatDate(stats.latestIntervention.date)}</span>
                </div>
              )}
            </div>
          )}
        </BlurContainer>
      )}

      {filteredInterventions.length === 0 ? (
        <BlurContainer className="p-8 text-center">
          <p className="text-muted-foreground">
            {selectedEquipment
              ? `Aucune intervention trouvée pour ${selectedEquipment}`
              : "Sélectionnez un équipement ou effectuez une recherche pour voir l'historique"
            }
          </p>
        </BlurContainer>
      ) : (
        <BlurContainer className="p-0 shadow-sm">
          <ScrollArea className="h-[500px] rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Équipement</TableHead>
                  <TableHead>Technicien</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterventions
                  .sort((a, b) => b.date.getTime() - a.date.getTime()) // Sort by date descending
                  .map((intervention) => (
                    <TableRow key={intervention.id}>
                      <TableCell className="font-medium">{formatDate(intervention.date)}</TableCell>
                      <TableCell>{intervention.title}</TableCell>
                      <TableCell>{intervention.equipment}</TableCell>
                      <TableCell>{intervention.technician}</TableCell>
                      <TableCell>
                        {intervention.status === 'completed' && intervention.duration
                          ? `${intervention.duration} h`
                          : `${intervention.scheduledDuration} h (prévu)`}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={intervention.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onViewDetails(intervention)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </BlurContainer>
      )}
    </div>
  );
};

export default EquipmentHistoryView;
