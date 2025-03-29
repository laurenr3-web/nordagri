
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NotificationCategoryCard } from './NotificationCategoryCard';
import { NotificationChannels } from './NotificationChannels';

interface InventoryAlertSettings {
  enabled: boolean;
  channels: string[];
  threshold: number;
}

interface InventoryAlertsCardProps {
  settings: InventoryAlertSettings;
  onToggle: (enabled: boolean) => void;
  onThresholdChange: (threshold: number) => void;
  onChannelToggle: (category: string, channel: string) => void;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  loading?: boolean;
}

export const InventoryAlertsCard = ({
  settings,
  onToggle,
  onThresholdChange,
  onChannelToggle,
  emailEnabled,
  pushEnabled,
  smsEnabled,
  loading = false
}: InventoryAlertsCardProps) => {
  return (
    <NotificationCategoryCard
      icon={ShoppingCart}
      title="Inventory Alerts"
      description="Notifications when parts inventory is low"
      enabled={settings.enabled}
      onToggle={onToggle}
      loading={loading}
    >
      <NotificationChannels 
        channels={settings.channels}
        category="inventory_alerts"
        onChannelToggle={onChannelToggle}
        emailEnabled={emailEnabled}
        pushEnabled={pushEnabled}
        smsEnabled={smsEnabled}
        loading={loading}
      />
      
      <div className="flex items-center gap-2">
        <Label htmlFor="inventory-threshold" className="w-24">Threshold:</Label>
        <Select 
          value={settings.threshold.toString()} 
          onValueChange={(value) => onThresholdChange(parseInt(value))}
          disabled={loading}
        >
          <SelectTrigger id="inventory-threshold" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 item</SelectItem>
            <SelectItem value="3">3 items</SelectItem>
            <SelectItem value="5">5 items</SelectItem>
            <SelectItem value="10">10 items</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </NotificationCategoryCard>
  );
};
