
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
  { value: 'performance', label: 'Performance', icon: BarChart3 },
  { value: 'timeTracking', label: 'Temps', icon: Clock },
  { value: 'qrcode', label: 'QR Code', icon: QrCode },
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
      {/* Scrollable tab bar */}
      <ScrollArea className="w-full">
        <div className="flex gap-1.5 pb-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  "hover:bg-accent/60",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>

      {/* Content */}
      <div>{renderContent()}</div>
    </div>
  );
};

export default EquipmentTabs;
