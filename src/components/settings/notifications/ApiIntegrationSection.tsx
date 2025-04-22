
import React from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';

export const ApiIntegrationSection = () => (
  <SettingsSection
    title="API Integration"
    description="Configure API access for third-party integrations"
  >
    <div className="flex items-start gap-4 mb-6">
      <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-secondary-foreground"><path d="M18 20a2 2 0 0 0 2-2V8l-8-6-8 6v10a2 2 0 0 0 2 2Z"></path><path d="m12 10-2 2h4l-2 2"></path></svg>
      </div>
      <div className="space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label htmlFor="enable-api" className="text-sm font-medium">Enable API Access</label>
            <p className="text-sm text-muted-foreground">
              Allow third-party applications to access your data via API
            </p>
          </div>
          <input id="enable-api" type="checkbox" checked readOnly className="switch" />
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <label htmlFor="equipment-api" className="text-sm font-medium">Equipment Endpoint</label>
            <p className="text-sm text-muted-foreground">
              Enable read access to equipment data
            </p>
          </div>
          <input id="equipment-api" type="checkbox" checked readOnly className="switch"/>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <label htmlFor="time-entries-api" className="text-sm font-medium">Time Entries Endpoint</label>
            <p className="text-sm text-muted-foreground">
              Allow creating time entries via API
            </p>
          </div>
          <input id="time-entries-api" type="checkbox" checked readOnly className="switch"/>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <label htmlFor="fuel-logs-api" className="text-sm font-medium">Fuel Logs Endpoint</label>
            <p className="text-sm text-muted-foreground">
              Allow reading and creating fuel logs via API
            </p>
          </div>
          <input id="fuel-logs-api" type="checkbox" checked readOnly className="switch"/>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <label htmlFor="inventory-sync-api" className="text-sm font-medium">Inventory Sync (ERP)</label>
            <p className="text-sm text-muted-foreground">
              Enable inventory synchronization with accounting software
            </p>
          </div>
          <input id="inventory-sync-api" type="checkbox" readOnly className="switch"/>
        </div>
        
        <div className="space-y-2 pt-4">
          <label htmlFor="api-key" className="text-sm font-medium">API Key</label>
          <div className="flex gap-2">
            <input id="api-key" type="password" value="••••••••••••••••••••••••••••••" readOnly className="font-mono bg-muted border rounded px-2"/>
            <Button variant="outline" size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use this key to authenticate API requests. Keep it secret.
          </p>
        </div>
        
        <Button className="mt-2" variant="outline">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9Z"></path><path d="M12 17v.01"></path><path d="M12 14a1.5 1.5 0 0 1 1-1.5 2.6 2.6 0 1 0-3-4"></path></svg>
          View API Documentation
        </Button>
      </div>
    </div>
  </SettingsSection>
);

export default ApiIntegrationSection;
