
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EquipmentOverview } from './EquipmentOverview';
import EquipmentMaintenanceStatus from './EquipmentMaintenanceStatus';
import EquipmentParts from '@/components/equipment/tabs/EquipmentParts';
import EquipmentTimeTracking from '@/components/equipment/tabs/EquipmentTimeTracking';
import EquipmentPerformance from '@/components/equipment/tabs/EquipmentPerformance';
import EquipmentMaintenanceHistory from '@/components/equipment/tabs/EquipmentMaintenanceHistory';
import EquipmentQRCode from '@/components/equipment/tabs/EquipmentQRCode';
import EquipmentFuelLogs from '@/components/equipment/tabs/fuel/EquipmentFuelLogs';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Menu } from 'lucide-react';

interface EquipmentTabsProps {
  equipment: any;
  forceDesktopTabs?: boolean; // <-- nouvelle prop
}

const moreTabs = [
  {
    value: "parts",
    label: "Pièces"
  },
  {
    value: "fuel",
    label: "Carburant"
  },
  {
    value: "performance",
    label: "Performance"
  },
  {
    value: "timeTracking",
    label: "Temps"
  },
  {
    value: "qrcode",
    label: "QR Code"
  }
];

const EquipmentTabs: React.FC<EquipmentTabsProps> = ({ equipment, forceDesktopTabs }) => {
  // On détecte le mobile UNIQUEMENT pour l’apparence, mais on force tab-list complet si forceDesktopTabs
  const isMobile = useIsMobile();
  const [tabValue, setTabValue] = useState("overview");

  // Gérer le changement d'onglet (depuis tab ou menu)
  const handleTabChange = (newValue: string) => {
    setTabValue(newValue);
  };

  const showDropdownMenu = !forceDesktopTabs && isMobile;

  return (
    <Tabs value={tabValue} onValueChange={handleTabChange} className="w-full">
      <div className={`w-full overflow-x-auto pb-2`}>
        <TabsList
          className={
            isMobile && !forceDesktopTabs
              ? "w-full flex gap-2 whitespace-nowrap items-center"
              : "w-full flex gap-4 whitespace-nowrap items-center bg-muted p-1 rounded-md"
          }
        >
          <TabsTrigger value="overview" className={isMobile && !forceDesktopTabs ? "py-1 px-2 text-sm" : "py-2 px-6 text-base"}>
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="maintenance" className={isMobile && !forceDesktopTabs ? "py-1 px-2 text-sm" : "py-2 px-6 text-base"}>
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="history" className={isMobile && !forceDesktopTabs ? "py-1 px-2 text-sm" : "py-2 px-6 text-base"}>
            Historique
          </TabsTrigger>
          {/* Menu déroulant pour les autres onglets en mobile, sinon tous visibles */}
          {showDropdownMenu ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Plus d'onglets"
                  className="ml-1 px-2 py-1 rounded hover:bg-muted/80 focus:bg-muted bg-background border border-input flex items-center"
                  type="button"
                  tabIndex={0}
                >
                  <Menu className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={4} className="z-50 min-w-[7rem]">
                {moreTabs.map(tab => (
                  <DropdownMenuItem
                    key={tab.value}
                    onSelect={() => handleTabChange(tab.value)}
                    className={[
                      "cursor-pointer",
                      tabValue === tab.value ? "bg-muted font-semibold" : ""
                    ].join(" ")}
                  >
                    {tab.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {moreTabs.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="py-2 px-6 text-base"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </>
          )}
        </TabsList>
      </div>

      <div className="mt-2">
        <TabsContent value="overview">
          <EquipmentOverview equipment={equipment} />
        </TabsContent>
        <TabsContent value="maintenance">
          <EquipmentMaintenanceStatus equipment={equipment} />
        </TabsContent>
        <TabsContent value="history">
          <EquipmentMaintenanceHistory equipment={equipment} />
        </TabsContent>
        <TabsContent value="parts">
          <EquipmentParts equipment={equipment} />
        </TabsContent>
        <TabsContent value="fuel">
          <EquipmentFuelLogs equipment={equipment} />
        </TabsContent>
        <TabsContent value="performance">
          <EquipmentPerformance equipment={equipment} />
        </TabsContent>
        <TabsContent value="timeTracking">
          <EquipmentTimeTracking equipment={equipment} />
        </TabsContent>
        <TabsContent value="qrcode">
          <EquipmentQRCode equipment={equipment} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default EquipmentTabs;
