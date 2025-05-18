
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, 
  Tractor, 
  Wrench, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Package2, 
  BarChart3, 
  CheckCircle2,
  User,
  Bell
} from "lucide-react";

import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { 
  StatsCardData, 
  EquipmentItem, 
  MaintenanceEvent, 
  AlertItem, 
  UpcomingTask,
  UrgentIntervention,
  StockAlert,
  CalendarEvent 
} from '@/hooks/dashboard/types/dashboardTypes';

interface BentoDashboardProps {
  statsData: StatsCardData[];
  equipmentData: EquipmentItem[];
  maintenanceEvents: MaintenanceEvent[];
  alertItems: AlertItem[];
  upcomingTasks: UpcomingTask[];
  urgentInterventions: UrgentIntervention[];
  stockAlerts: StockAlert[];
  weeklyCalendarEvents: CalendarEvent[];
  handleStatsCardClick: (type: string) => void;
  handleEquipmentViewAllClick: () => void;
  handleMaintenanceCalendarClick: () => void;
  handleAlertsViewAllClick: () => void;
  handleEquipmentClick: (id: number) => void;
}

const BentoDashboard: React.FC<BentoDashboardProps> = ({
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
  handleEquipmentClick
}) => {
  const navigate = useNavigate();

  // Create dashboard features for the bento grid
  const features = [
    {
      Icon: Tractor,
      name: "Équipements actifs",
      description: `${equipmentData.filter(e => e.status === 'operational').length} équipements en service sur ${equipmentData.length} total.`,
      onClick: () => handleEquipmentViewAllClick(),
      cta: "Voir tous les équipements",
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Tractor size={200} />
        </div>
      ),
      className: "lg:row-span-2 lg:col-span-1"
    },
    {
      Icon: AlertTriangle,
      name: "Alertes urgentes",
      description: `${alertItems.filter(a => a.severity === 'high').length} alertes nécessitant une action immédiate.`,
      onClick: () => handleAlertsViewAllClick(),
      cta: "Voir toutes les alertes",
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <AlertTriangle size={200} />
        </div>
      ),
      className: "lg:col-span-1 lg:row-span-1"
    },
    {
      Icon: Wrench,
      name: "Maintenance",
      description: `${maintenanceEvents.filter(m => m.priority === 'high').length} interventions prioritaires planifiées.`,
      onClick: () => handleMaintenanceCalendarClick(),
      cta: "Voir le calendrier",
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Wrench size={200} />
        </div>
      ),
      className: "lg:row-span-2 lg:col-span-1"
    },
    {
      Icon: Clock,
      name: "Suivi du temps",
      description: "Gérez vos heures de travail et la répartition par équipement.",
      onClick: () => navigate('/time-tracking'),
      cta: "Démarrer le suivi",
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Clock size={200} />
        </div>
      ),
      className: "lg:col-span-1 lg:row-span-1"
    },
    {
      Icon: Package2,
      name: "Pièces en stock faible",
      description: `${stockAlerts.length} pièces à commander prochainement.`,
      onClick: () => navigate('/parts'),
      cta: "Gérer l'inventaire",
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Package2 size={200} />
        </div>
      ),
      className: "lg:col-span-1 lg:row-span-1"
    },
    {
      Icon: BarChart3,
      name: "Statistiques",
      description: "Visualisez les performances de votre exploitation agricole.",
      onClick: () => navigate('/dashboard'),
      cta: "Voir les statistiques",
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <BarChart3 size={200} />
        </div>
      ),
      className: "lg:col-span-1 lg:row-span-1"
    },
  ];

  // Only show if there are urgent interventions
  if (urgentInterventions.length > 0) {
    features.push({
      Icon: Bell,
      name: "Interventions urgentes",
      description: `${urgentInterventions.length} interventions nécessitant une attention immédiate.`,
      onClick: () => navigate('/interventions'),
      cta: "Voir les interventions",
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Bell size={200} />
        </div>
      ),
      className: "lg:col-span-1 lg:row-span-1"
    });
  }

  // Only show if there are upcoming tasks
  if (upcomingTasks.length > 0) {
    features.push({
      Icon: Calendar,
      name: "Tâches à venir",
      description: `${upcomingTasks.length} tâches planifiées dans les 7 prochains jours.`,
      onClick: () => navigate('/maintenance'),
      cta: "Voir les tâches",
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Calendar size={200} />
        </div>
      ),
      className: "lg:col-span-1 lg:row-span-1"
    });
  }

  return (
    <div className="space-y-6 px-4 md:px-[38px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold mb-0">Tableau de bord Bento</h1>
      </div>

      <BentoGrid className="lg:grid-rows-3 md:auto-rows-[18rem]">
        {features.map((feature) => (
          <BentoCard 
            key={feature.name} 
            {...feature} 
          />
        ))}
      </BentoGrid>
    </div>
  );
};

export default BentoDashboard;
