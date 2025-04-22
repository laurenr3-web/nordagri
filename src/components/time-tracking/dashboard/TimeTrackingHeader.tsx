
import React from 'react';
import { Button } from '@/components/ui/button';
import { Timer, Plus } from 'lucide-react';
import { ExportButton } from '@/components/common/ExportButton';

interface TimeTrackingHeaderProps {
  onNewSession: () => void;
  exportData?: any[];
  exportHeaders?: { label: string; key: string }[];
  onExportPDF?: () => Promise<void>;
}

export function TimeTrackingHeader({
  onNewSession,
  exportData = [],
  exportHeaders = [],
  onExportPDF
}: TimeTrackingHeaderProps) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Suivi du temps</h2>
          <p className="text-muted-foreground">
            Suivez et gérez vos activités quotidiennes
          </p>
        </div>
        <div className="flex items-center gap-2">
          {exportData && exportData.length > 0 && (
            <ExportButton
              data={exportData}
              filename="suivi-temps"
              headers={exportHeaders}
              onExportPDF={onExportPDF}
            />
          )}
          <Button onClick={onNewSession}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle session
          </Button>
        </div>
      </div>
    </div>
  );
}
