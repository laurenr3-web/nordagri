
import React, { useState } from 'react';
import { EquipmentOverview } from './EquipmentOverview';
import EquipmentMaintenanceStatus from './EquipmentMaintenanceStatus';
import EquipmentParts from '@/components/equipment/tabs/EquipmentParts';
import EquipmentTimeTracking from '@/components/equipment/tabs/EquipmentTimeTracking';
import EquipmentPerformance from '@/components/equipment/tabs/EquipmentPerformance';
import EquipmentMaintenanceHistory from '@/components/equipment/tabs/EquipmentMaintenanceHistory';
import EquipmentQRCode from '@/components/equipment/tabs/EquipmentQRCode';
import EquipmentFuelLogs from '@/components/equipment/tabs/fuel/EquipmentFuelLogs';
import { 
  LayoutDashboard, Wrench, History, Package, Fuel, BarChart3, Clock, QrCode 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EquipmentTabsProps {
  equipment: any;
  forceDesktopTabs?: boolean;
}

const tabs = [
  { value: 'overview', label: 'Aperçu', icon: LayoutDashboard },
  { value: 'maintenance', label: 'Maintenance', icon: Wrench },
  { value: 'history', label: 'Historique', icon: History },
  { value: 'parts', label: 'Pièces', icon: Package },
  { value: 'fuel', label: 'Carburant', icon: Fuel },
  { value: 'performance', label: 'Perf.', icon: BarChart3 },
  { value: 'timeTracking', label: 'Temps', icon: Clock },
  { value: 'qrcode', label: 'QR', icon: QrCode },
];

const EquipmentTabs: React.FC<EquipmentTabsProps> = ({ equipment }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <EquipmentOverview equipment={equipment} />;
      case 'maintenance': return <EquipmentMaintenanceStatus equipment={equipment} />;
      case 'history': return <EquipmentMaintenanceHistory equipment={equipment} />;
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
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-md py-1.5 px-1 text-[10px] sm:text-xs font-medium transition-all min-w-0",
                "hover:bg-accent/60",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground bg-muted/40"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate w-full text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div>{renderContent()}</div>
    </div>
  );
};

export default EquipmentTabs;
