
import React from 'react';
import { SettingsSection } from '../SettingsSection';
import { Bell } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface InventoryAlertSectionProps {
  notifPrefs: any;
  loadingNotif: boolean;
  handleNotifChange: (key: string, value: boolean) => void;
}

export const InventoryAlertSection = ({
  notifPrefs,
  loadingNotif,
  handleNotifChange,
}: InventoryAlertSectionProps) => (
  <SettingsSection 
    title="Inventory Alert Thresholds" 
    description="Set up minimum stock level alerts for parts and supplies"
  >
    <div className="flex items-start gap-4 mb-6">
      <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
        <Bell className="h-8 w-8 text-secondary-foreground" />
      </div>
      <div className="space-y-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min-parts">Minimum Parts Stock Level</Label>
            <div className="flex items-center gap-2">
              <Input id="min-parts" type="number" defaultValue="5" />
              <span className="text-sm text-muted-foreground">units</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Alert when stock falls below this threshold
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="critical-parts">Critical Parts Threshold</Label>
            <div className="flex items-center gap-2">
              <Input id="critical-parts" type="number" defaultValue="2" />
              <span className="text-sm text-muted-foreground">units</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Urgent alert for critical components
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reorder-lead-time">Reorder Lead Time</Label>
          <div className="flex items-center gap-2">
            <Input id="reorder-lead-time" type="number" defaultValue="7" />
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Time to account for when suggesting reordering
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <Label htmlFor="auto-reorder">Automatic Reorder Suggestions</Label>
            <p className="text-sm text-muted-foreground">
              Generate suggested orders based on thresholds
            </p>
          </div>
          <Switch id="auto-reorder" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <Label htmlFor="stock-low-alert-enabled">Activate Stock Low Alerts</Label>
            <p className="text-sm text-muted-foreground">
              <span>Enable/disable email & SMS if parts are below threshold</span>
            </p>
          </div>
          <Switch
            id="stock-low-alert-enabled"
            checked={!!notifPrefs.stock_low_enabled}
            disabled={loadingNotif}
            onCheckedChange={(v) => handleNotifChange('stock_low_enabled', v)}
          />
        </div>
      </div>
    </div>
  </SettingsSection>
);

export default InventoryAlertSection;
