
import React, { useState } from 'react';
import { EquipmentOverview } from './EquipmentOverview';
import OverviewRecent from '@/components/equipment/detail/OverviewRecent';
import EquipmentMaintenanceStatus from './EquipmentMaintenanceStatus';
import EquipmentParts from '@/components/equipment/tabs/EquipmentParts';
import EquipmentTimeTracking from '@/components/equipment/tabs/EquipmentTimeTracking';
import EquipmentPerformance from '@/components/equipment/tabs/EquipmentPerformance';
import EquipmentMaintenanceHistory from '@/components/equipment/tabs/EquipmentMaintenanceHistory';
import EquipmentQRCode from '@/components/equipment/tabs/EquipmentQRCode';
import EquipmentFuelLogs from '@/components/equipment/tabs/fuel/EquipmentFuelLogs';
import EquipmentPointsList from '@/components/equipment/detail/EquipmentPointsList';
import {
  LayoutDashboard, Wrench, History, Package, QrCode, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EquipmentTabsProps {
  equipment: any;
  forceDesktopTabs?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const tabs = [
  { value: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { value: 'maintenance', label: 'Maintenance', icon: Wrench },
  { value: 'points', label: 'Points', icon: Eye },
  { value: 'history', label: 'Historique', icon: History },
  { value: 'parts', label: 'Pièces', icon: Package },
  { value: 'qrcode', label: 'QR code', icon: QrCode },
];

const EquipmentTabs: React.FC<EquipmentTabsProps> = ({ equipment, activeTab: activeTabProp, onTabChange }) => {
  const [internalTab, setInternalTab] = useState('overview');
  const activeTab = activeTabProp ?? internalTab;
  const setActiveTab = (v: string) => { setInternalTab(v); onTabChange?.(v); };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewRecent equipment={equipment} onNavigateToTab={setActiveTab} />;
      case 'maintenance': return <EquipmentMaintenanceStatus equipment={equipment} />;
      case 'points': return <EquipmentPointsList equipment={equipment} />;
      case 'history':
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <button onClick={() => setActiveTab('fuel')} className="px-3 py-1.5 rounded-full border border-border/60 hover:bg-accent/40">Carburant</button>
              <button onClick={() => setActiveTab('performance')} className="px-3 py-1.5 rounded-full border border-border/60 hover:bg-accent/40">Performance</button>
              <button onClick={() => setActiveTab('timeTracking')} className="px-3 py-1.5 rounded-full border border-border/60 hover:bg-accent/40">Temps</button>
            </div>
            <EquipmentMaintenanceHistory equipment={equipment} />
          </div>
        );
      case 'parts': return <EquipmentParts equipment={equipment} />;
      case 'fuel': return <EquipmentFuelLogs equipment={equipment} />;
      case 'performance': return <EquipmentPerformance equipment={equipment} />;
      case 'timeTracking': return <EquipmentTimeTracking equipment={equipment} />;
      case 'qrcode': return <EquipmentQRCode equipment={equipment} />;
      default: return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-md py-1.5 px-0.5 text-[9px] sm:text-xs font-medium transition-all min-w-0",
                "hover:bg-accent/60",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground bg-muted/40"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="w-full text-center leading-tight break-words">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div>{renderContent()}</div>
    </div>
  );
};

export default EquipmentTabs;
