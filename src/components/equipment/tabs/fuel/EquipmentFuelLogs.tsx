
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Plus, Calendar } from 'lucide-react';
import { FuelLogsTable } from './FuelLogsTable';
import { useFuelLogs } from '@/hooks/equipment/useFuelLogs';
import { useFuelLogsExport } from '@/hooks/equipment/useFuelLogsExport';
import { FuelLogDialog } from './FuelLogDialog';
import { ExportButton } from '@/components/common/ExportButton';

interface EquipmentFuelLogsProps {
  equipment: any;
}

const EquipmentFuelLogs: React.FC<EquipmentFuelLogsProps> = ({ equipment }) => {
  const {
    fuelLogs,
    isLoading,
    addFuelLog,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isFarmIdLoading,
    farmId,
    deleteFuelLog,
  } = useFuelLogs(equipment?.id);

  const {
    formatLogsForExport,
    exportFuelLogsToPDF,
    headers: exportHeaders
  } = useFuelLogsExport();

  const exportableLogs = fuelLogs ? formatLogsForExport(fuelLogs) : [];

  const handleExportPDF = async () => {
    if (equipment?.name && fuelLogs) {
      await exportFuelLogsToPDF(fuelLogs, equipment.name);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Journal de carburant</h2>
        <div className="flex gap-2">
          <ExportButton
            data={exportableLogs}
            filename={`carburant-${equipment?.name ? equipment.name.toLowerCase().replace(/\s+/g, '-') : 'equipement'}`}
            headers={exportHeaders}
            onExportPDF={handleExportPDF}
            disabled={isLoading || !fuelLogs || fuelLogs.length === 0}
          />
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un plein
          </Button>
        </div>
      </div>

      <FuelLogsTable
        logs={fuelLogs || []}
        isLoading={isLoading}
        onDelete={deleteFuelLog}
      />

      <FuelLogDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={(data) => addFuelLog.mutate(data)}
        isSubmitting={addFuelLog.isPending}
        equipment={equipment}
      />
    </div>
  );
};

export default EquipmentFuelLogs;
