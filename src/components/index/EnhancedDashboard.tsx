
import React, { useMemo, useCallback } from 'react';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/dashboard/SortableItem';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useDashboardPreferences } from '@/hooks/dashboard/useDashboardPreferences';
import { DashboardCustomizer } from '@/components/dashboard/DashboardCustomizer';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { StatsSectionRefined } from '@/components/dashboard/sections/StatsSectionRefined';
import { EquipmentSectionRefined } from '@/components/dashboard/sections/EquipmentSectionRefined';
import { UrgentInterventionsSectionRefined } from '@/components/dashboard/sections/UrgentInterventionsSectionRefined';
import { WeeklyCalendarSectionRefined } from '@/components/dashboard/sections/WeeklyCalendarSectionRefined';
import { AlertsSectionRefined } from '@/components/dashboard/sections/AlertsSectionRefined';
import { StockSectionRefined } from '@/components/dashboard/sections/StockSectionRefined';
import { TasksSectionRefined } from '@/components/dashboard/sections/TasksSectionRefined';

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
  handleStatsCardClick,
  handleEquipmentViewAllClick,
  handleMaintenanceCalendarClick,
  handleAlertsViewAllClick,
  handleTasksAddClick,
  handleEquipmentClick
}) => {
  const navigate = useNavigate();

  // Use our preferences hook
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

  // Set up the sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Memoized search items to avoid unnecessary recalculations
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

  // Optimized event handlers with useCallback
  const handleViewIntervention = useCallback((id: number) => {
    console.log('View intervention:', id);
    navigate(`/interventions?id=${id}`);
  }, [navigate]);
  
  const handleViewParts = useCallback(() => {
    console.log('View parts');
    navigate('/parts');
  }, [navigate]);
  
  const handleViewCalendarEvent = useCallback((id: string | number, type: string) => {
    console.log(`View calendar event: ${id}, type: ${type}`);
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

  // Handle the end of the drag-and-drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = Object.values(preferences.sections).findIndex(section => section.id === active.id);
      const newIndex = Object.values(preferences.sections).findIndex(section => section.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const sortedSections = Object.values(preferences.sections).sort((a, b) => a.order - b.order);
        const reorderedSections = arrayMove(sortedSections, oldIndex, newIndex);
        
        // Update the orders
        const updatedSections = { ...preferences.sections };
        reorderedSections.forEach((section, index) => {
          updatedSections[section.id] = {
            ...updatedSections[section.id],
            order: index
          };
        });
        
        // Update the state
        updateSectionOrder(updatedSections);
        toast.success("Disposition mise à jour");
      }
    }
  };

  // Get visible sections sorted by order
  const visibleSections = Object.values(preferences.sections)
    .filter(section => section.visible)
    .sort((a, b) => a.order - b.order)
    .map(section => section.id);

  // Compute column class based on preferences
  const gridColsClass = useMemo(() => {
    switch (preferences.columnCount) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 lg:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      default: return "grid-cols-1 lg:grid-cols-3";
    }
  }, [preferences.columnCount]);

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

      <StatsSectionRefined statsData={statsData} onStatClick={handleStatsCardClick} />
      
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
              {visibleSections.map((sectionId) => (
                <SortableItem key={sectionId} id={sectionId}>
                  {sectionId === 'equipment' && (
                    <EquipmentSectionRefined 
                      equipmentData={equipmentData}
                      isEditing={isEditing}
                      onViewAll={handleEquipmentViewAllClick}
                      onEquipmentClick={handleEquipmentClick}
                    />
                  )}
                  {sectionId === 'urgent-interventions' && (
                    <UrgentInterventionsSectionRefined 
                      interventions={urgentInterventions}
                      isEditing={isEditing}
                      onViewAll={() => handleViewIntervention(-1)}
                      onViewDetails={handleViewIntervention}
                    />
                  )}
                  {sectionId === 'weekly-calendar' && (
                    <WeeklyCalendarSectionRefined 
                      events={weeklyCalendarEvents}
                      isEditing={isEditing}
                      onViewEvent={handleViewCalendarEvent}
                    />
                  )}
                  {sectionId === 'alerts' && (
                    <AlertsSectionRefined 
                      alerts={alertItems}
                      isEditing={isEditing}
                      onViewAll={handleAlertsViewAllClick}
                    />
                  )}
                  {sectionId === 'stock' && (
                    <StockSectionRefined 
                      alerts={stockAlerts}
                      isEditing={isEditing}
                      onViewParts={handleViewParts}
                    />
                  )}
                  {sectionId === 'tasks' && (
                    <TasksSectionRefined 
                      tasks={upcomingTasks}
                      isEditing={isEditing}
                      onAddTask={handleTasksAddClick}
                    />
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

// Optimize re-renders with React.memo
export default React.memo(EnhancedDashboard);
