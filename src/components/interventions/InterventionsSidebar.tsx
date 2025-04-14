
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Wrench, Clock, CheckCircle2, AlertTriangle, Plus, BarChart3, History } from 'lucide-react';
import { Intervention } from '@/types/Intervention';
import { formatDate } from './utils/interventionUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface InterventionsSidebarProps {
  interventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
  searchQuery?: string;
  selectedPriority?: string | null;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPriorityChange?: (priority: string | null) => void;
  onClearSearch?: () => void;
}

const InterventionsSidebar: React.FC<InterventionsSidebarProps> = ({ 
  interventions = [], 
  onViewDetails,
  searchQuery = '',
  selectedPriority = null,
  onSearchChange,
  onPriorityChange,
  onClearSearch
}) => {
  // Calculate statistics
  const stats = {
    total: interventions.length,
    scheduled: interventions.filter(i => i.status === 'scheduled').length,
    inProgress: interventions.filter(i => i.status === 'in-progress').length,
    completed: interventions.filter(i => i.status === 'completed').length,
    canceled: interventions.filter(i => i.status === 'cancelled').length
  };
  
  // Calculate percentages for progress bars
  const getPercentage = (value: number): number => {
    return stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
  };

  // Group interventions by equipment
  const equipmentStats = interventions.reduce((acc, intervention) => {
    acc[intervention.equipment] = (acc[intervention.equipment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search section if search props are provided */}
      {onSearchChange && (
        <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              Recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Rechercher une intervention..."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full"
              />
              
              <div className="flex flex-wrap gap-2">
                {['high', 'medium', 'low'].map((priority) => (
                  <Badge
                    key={priority}
                    className={`cursor-pointer ${
                      selectedPriority === priority
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    onClick={() => onPriorityChange?.(selectedPriority === priority ? null : priority)}
                  >
                    {priority === 'high' ? 'Haute' : priority === 'medium' ? 'Moyenne' : 'Basse'}
                  </Badge>
                ))}
                
                {(searchQuery || selectedPriority) && (
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted"
                    onClick={onClearSearch}
                  >
                    Effacer
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-agri-100 bg-gradient-to-br from-agri-50 to-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-agri-600" />
            À venir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interventions
              .filter(intervention => intervention.status === 'scheduled')
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 3)
              .map((intervention) => (
                <div 
                  key={intervention.id} 
                  className="flex items-start gap-3 pb-3 border-b last:border-0 cursor-pointer hover:bg-white/80 p-2 rounded-md transition-colors"
                  onClick={() => onViewDetails(intervention)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Voir les détails de l'intervention ${intervention.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onViewDetails(intervention);
                    }
                  }}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm
                    ${intervention.priority === 'high' ? 'bg-red-50 text-red-600' : 
                      intervention.priority === 'medium' ? 'bg-harvest-50 text-harvest-600' : 
                      'bg-agri-50 text-agri-600'}`}>
                    <Wrench size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{intervention.title}</h4>
                    <p className="text-sm text-muted-foreground mb-1 truncate">{intervention.equipment}</p>
                    <p className="text-xs px-2 py-1 bg-background rounded-full inline-block">
                      {formatDate(intervention.date)}
                    </p>
                  </div>
                </div>
              ))
            }
            
            {interventions.filter(i => i.status === 'scheduled').length === 0 && (
              <p className="text-sm text-muted-foreground py-2 text-center">Aucune intervention planifiée.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Statistiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1 border-b pb-2">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium text-lg">{stats.total}</span>
            </div>
            
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-agri-500 mr-2"></div>
                    <span className="truncate">Planifiées</span>
                  </span>
                  <span className="font-medium">{stats.scheduled}</span>
                </div>
                <Progress value={getPercentage(stats.scheduled)} className="h-2 bg-muted" indicatorClassName="bg-agri-500" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-harvest-500 mr-2"></div>
                    <span className="truncate">En cours</span>
                  </span>
                  <span className="font-medium">{stats.inProgress}</span>
                </div>
                <Progress value={getPercentage(stats.inProgress)} className="h-2 bg-muted" indicatorClassName="bg-harvest-500" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <span className="truncate">Terminées</span>
                  </span>
                  <span className="font-medium">{stats.completed}</span>
                </div>
                <Progress value={getPercentage(stats.completed)} className="h-2 bg-muted" indicatorClassName="bg-blue-500" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                    <span className="truncate">Annulées</span>
                  </span>
                  <span className="font-medium">{stats.canceled}</span>
                </div>
                <Progress value={getPercentage(stats.canceled)} className="h-2 bg-muted" indicatorClassName="bg-red-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-soil-100 bg-gradient-to-br from-soil-50 to-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-soil-600" />
            Équipements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[250px] overflow-y-auto scrollbar-thin pr-1">
            {Object.entries(equipmentStats)
              .sort((a, b) => b[1] - a[1])
              .map(([equipment, count], index) => (
                <div key={equipment} className="flex items-center justify-between py-1 border-b border-muted/50 last:border-0">
                  <span className="flex items-center max-w-[75%] text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      index % 4 === 0 ? 'bg-agri-500' : 
                      index % 4 === 1 ? 'bg-harvest-500' : 
                      index % 4 === 2 ? 'bg-soil-500' :
                      'bg-blue-500'
                    }`}></div>
                    <span className="truncate" title={equipment}>{equipment}</span>
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              
            {Object.keys(equipmentStats).length === 0 && (
              <p className="text-sm text-muted-foreground py-2 text-center">Aucun équipement avec des interventions.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterventionsSidebar;
