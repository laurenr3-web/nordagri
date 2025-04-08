import React, { useMemo, useCallback } from 'react';
import StatsSection from './StatsSection';
import EquipmentSection from './EquipmentSection';
import MaintenanceSection from './MaintenanceSection';
import AlertsSection from './AlertsSection';
import TasksSection from './TasksSection';
import { DraggableDashboardSection } from '@/components/dashboard/DraggableDashboardSection';
import { UrgentInterventionsTable } from '@/components/dashboard/UrgentInterventionsTable';
import { StockAlerts } from '@/components/dashboard/StockAlerts';
import { WeeklyCalendar } from '@/components/dashboard/WeeklyCalendar';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useDashboardPreferences } from '@/hooks/dashboard/useDashboardPreferences';
import { DashboardCustomizer } from '@/components/dashboard/DashboardCustomizer';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/dashboard/SortableItem';
import { toast } from 'sonner';

interface EnhancedDashboardProps {
  statsData: any[];
  equipmentData: any[];
  maintenanceEvents: any[];
  alertItems: any[];
  upcomingTasks: any[];
  urgentInterventions: any[];
  stockAlerts: any[];
  weeklyCalendarEvents: any[];
  currentMonth: Date;
  handleStatsCardClick: (type: string) => void;
  handleEquipmentViewAllClick: () => void;
  handleMaintenanceCalendarClick: () => void;
  handleAlertsViewAllClick: () => void;
  handleTasksAddClick: () => void;
  handleEquipmentClick: (id: number) => void;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  statsData,
  equipmentData,
  maintenanceEvents,
  alertItems,
  upcomingTasks,
  urgentInterventions,
  stockAlerts,
  weeklyCalendarEvents,
  currentMonth,
  handleStatsCardClick,
  handleEquipmentViewAllClick,
  handleMaintenanceCalendarClick,
  handleAlertsViewAllClick,
  handleTasksAddClick,
  handleEquipmentClick
}) => {
  const navigate = useNavigate();

  // Utiliser notre hook de préférences
  const {
    preferences,
    isEditing,
    setIsEditing,
    toggleSectionVisibility,
    updateSectionOrder,
    updateLayout,
    updateColumnCount,
    resetPreferences
  } = useDashboardPreferences();

  // Configuration des capteurs pour le drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Mémoisation des éléments de recherche pour éviter des recalculs inutiles
  const searchItems = useMemo(() => [...equipmentData.map(item => ({
    id: item.id,
    title: item.name,
    subtitle: item.type,
    type: 'equipment' as const,
    url: `/equipment/${item.id}`
  })), ...urgentInterventions.map(item => ({
    id: item.id,
    title: item.title,
    subtitle: item.equipment,
    type: 'intervention' as const,
    url: `/interventions?id=${item.id}`
  })), ...stockAlerts.map(item => ({
    id: item.id,
    title: item.name,
    subtitle: `Stock: ${item.currentStock}/${item.reorderPoint}`,
    type: 'part' as const,
    url: `/parts?id=${item.id}`
  })), ...upcomingTasks.map(item => ({
    id: item.id,
    title: item.title,
    subtitle: item.description,
    type: 'task' as const,
    url: `/maintenance?taskId=${item.id}`
  }))], [equipmentData, urgentInterventions, stockAlerts, upcomingTasks]);

  // Optimisation des gestionnaires d'événements avec useCallback
  const handleViewIntervention = useCallback((id: number) => {
    navigate(`/interventions?id=${id}`);
  }, [navigate]);
  
  const handleViewParts = useCallback(() => {
    navigate('/parts');
  }, [navigate]);
  
  const handleViewCalendarEvent = useCallback((id: string | number, type: string) => {
    switch (type) {
      case 'maintenance':
      case 'task':
        navigate(`/maintenance?taskId=${id}`);
        break;
      case 'intervention':
        navigate(`/interventions?id=${id}`);
        break;
      default:
        break;
    }
  }, [navigate]);

  // Gérer la fin du glisser-déposer
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = Object.values(preferences.sections).findIndex(section => section.id === active.id);
      const newIndex = Object.values(preferences.sections).findIndex(section => section.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const sortedSections = Object.values(preferences.sections).sort((a, b) => a.order - b.order);
        const reorderedSections = arrayMove(sortedSections, oldIndex, newIndex);
        
        // Mise à jour des ordres
        const updatedSections = { ...preferences.sections };
        reorderedSections.forEach((section, index) => {
          updatedSections[section.id] = {
            ...updatedSections[section.id],
            order: index
          };
        });
        
        // Mettre à jour l'état
        updateSectionOrder(updatedSections);
        toast.success("Disposition mise à jour");
      }
    }
  };

  // Obtenir les sections visibles et triées par ordre
  const visibleSections = Object.values(preferences.sections)
    .filter(section => section.visible)
    .sort((a, b) => a.order - b.order)
    .map(section => section.id);

  // Fonction pour fournir des détails supplémentaires pour les StatsCards
  const getStatCardDetails = (title: string) => {
    switch(title) {
      case "Active Equipment":
        return (
          <div className="space-y-2">
            <p className="text-sm">Équipements actifs par catégorie:</p>
            <ul className="space-y-1">
              <li className="flex justify-between"><span>Tracteurs</span> <span className="font-medium">12</span></li>
              <li className="flex justify-between"><span>Moissonneuses</span> <span className="font-medium">5</span></li>
              <li className="flex justify-between"><span>Irrigation</span> <span className="font-medium">8</span></li>
              <li className="flex justify-between"><span>Autres</span> <span className="font-medium">7</span></li>
            </ul>
          </div>
        );
      case "Maintenance Tasks":
        return "Comprend les maintenances préventives programmées, les maintenances correctives et les vérifications de routine.";
      case "Parts Inventory":
        return (
          <div className="space-y-2">
            <p className="text-sm">Valeur totale de stock: <span className="font-medium">24 560 €</span></p>
            <p className="text-sm">Pièces en dessous du seuil minimum: <span className="font-medium text-alert-red">14</span></p>
          </div>
        );
      case "Field Interventions":
        return "Interventions techniques sur le terrain, incluant les réparations, diagnostics et installations.";
      default:
        return undefined;
    }
  };

  // Calculer le nombre de colonnes en fonction des préférences
  const gridColsClass = useMemo(() => {
    switch (preferences.columnCount) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 lg:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      default: return "grid-cols-1 lg:grid-cols-3";
    }
  }, [preferences.columnCount]);

  // Rendre les sections de manière dynamique
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'equipment':
        return (
          <SortableItem id="equipment">
            <DraggableDashboardSection
              id="equipment"
              title="État des équipements"
              subtitle="Surveillez les performances de votre flotte"
              action={
                <Button variant="outline" size="sm" onClick={handleEquipmentViewAllClick}>
                  Voir tout
                </Button>
              }
              isDraggable={isEditing}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipmentData.map((item, index) => (
                  <div 
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => handleEquipmentClick(item.id)}
                  >
                    {/* Content of equipment item */}
                    <div className="border rounded-md p-4 hover:border-primary transition-colors">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DraggableDashboardSection>
          </SortableItem>
        );
        
      case 'urgent-interventions':
        return (
          <SortableItem id="urgent-interventions">
            <DraggableDashboardSection
              id="urgent-interventions"
              title="Interventions urgentes"
              subtitle="Interventions critiques en attente"
              action={
                <Button variant="outline" size="sm" onClick={() => handleViewIntervention(-1)}>
                  Toutes les interventions
                </Button>
              }
              isDraggable={isEditing}
            >
              <UrgentInterventionsTable 
                interventions={urgentInterventions} 
                onViewDetails={handleViewIntervention} 
              />
            </DraggableDashboardSection>
          </SortableItem>
        );
        
      case 'weekly-calendar':
        return (
          <SortableItem id="weekly-calendar">
            <DraggableDashboardSection
              id="weekly-calendar"
              title="Calendrier de la semaine"
              subtitle="Vos rendez-vous à venir"
              isDraggable={isEditing}
            >
              <WeeklyCalendar
                events={weeklyCalendarEvents}
                onViewEvent={handleViewCalendarEvent}
              />
            </DraggableDashboardSection>
          </SortableItem>
        );
        
      case 'alerts':
        return (
          <SortableItem id="alerts">
            <DraggableDashboardSection
              id="alerts"
              title="Alertes"
              subtitle="Notifications importantes"
              action={
                <Button variant="outline" size="sm" onClick={handleAlertsViewAllClick}>
                  Voir tout
                </Button>
              }
              isDraggable={isEditing}
            >
              <div className="space-y-4">
                {alertItems.slice(0, 3).map((alert, index) => (
                  <div key={alert.id} className="border rounded-md p-3">
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                ))}
              </div>
            </DraggableDashboardSection>
          </SortableItem>
        );
        
      case 'stock':
        return (
          <SortableItem id="stock">
            <DraggableDashboardSection
              id="stock"
              title="Stock faible"
              subtitle="Pièces à réapprovisionner"
              action={
                <Button variant="outline" size="sm" onClick={handleViewParts}>
                  Gérer le stock
                </Button>
              }
              isDraggable={isEditing}
            >
              <StockAlerts alerts={stockAlerts} onViewParts={handleViewParts} />
            </DraggableDashboardSection>
          </SortableItem>
        );
        
      case 'tasks':
        return (
          <SortableItem id="tasks">
            <DraggableDashboardSection
              id="tasks"
              title="Tâches à venir"
              subtitle="Vos prochaines tâches planifiées"
              action={
                <Button variant="outline" size="sm" onClick={handleTasksAddClick}>
                  Ajouter
                </Button>
              }
              isDraggable={isEditing}
            >
              <div className="space-y-4">
                {upcomingTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="border rounded-md p-3">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {task.dueDate.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </DraggableDashboardSection>
          </SortableItem>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 my-0 py-0 rounded-lg">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold mb-0">Tableau de bord</h1>
        <div className="flex items-center gap-2">
          <DashboardCustomizer
            preferences={preferences}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            toggleSectionVisibility={toggleSectionVisibility}
            updateLayout={updateLayout}
            updateColumnCount={updateColumnCount}
            resetPreferences={resetPreferences}
          />
          <SearchBar searchItems={searchItems} className="w-[250px] lg:w-[300px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsData.map((stat, index) => {
          // Utiliser l'icône spécifique de la stat ou trouver l'icône correspondante
          const IconComponent = stat.icon;
          
          return (
            <StatsCard 
              key={index} 
              title={stat.title} 
              value={stat.value} 
              icon={IconComponent} 
              description={stat.description} 
              trend={stat.trend} 
              details={getStatCardDetails(stat.title)}
              style={{
                animationDelay: `${index * 0.1}s`
              } as React.CSSProperties}
              onClick={() => handleStatsCardClick(stat.title)}
            />
          );
        })}
      </div>
      
      <div className={`w-full transition-all duration-300 ${isEditing ? 'bg-muted/30 p-4 border border-dashed rounded-lg' : ''}`}>
        {isEditing && (
          <div className="bg-accent/80 p-2 rounded-md mb-4 text-sm text-center">
            Glissez et déposez les sections pour réorganiser votre tableau de bord
          </div>
        )}
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={visibleSections} strategy={verticalListSortingStrategy}>
            <div className={`grid ${gridColsClass} gap-6`}>
              {visibleSections.map((sectionId, index) => (
                <React.Fragment key={sectionId}>
                  {renderSection(sectionId)}
                </React.Fragment>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

// Optimiser les re-renders avec React.memo
export default React.memo(EnhancedDashboard);
