
import React, { useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileSpreadsheet, Database, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";

export const DataExportSection = () => {
  const [exportType, setExportType] = useState<'csv' | 'json' | 'excel'>('csv');
  const [loading, setLoading] = useState(false);
  const [includeEquipment, setIncludeEquipment] = useState(true);
  const [includeMaintenance, setIncludeMaintenance] = useState(true);
  const [includeParts, setIncludeParts] = useState(true);
  const [includeInterventions, setIncludeInterventions] = useState(true);
  const [dateRange, setDateRange] = useState<'all' | 'year' | 'month' | 'custom'>('all');

  const handleExport = async () => {
    try {
      setLoading(true);
      toast.info('Préparation de l\'export des données...');
      
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        throw new Error('No authenticated user');
      }
      
      // Determine what data to export
      const dataToExport = [];
      
      if (includeEquipment) {
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('*');
          
        if (equipmentError) throw equipmentError;
        dataToExport.push({ name: 'equipment', data: equipmentData });
      }
      
      if (includeMaintenance) {
        const { data: maintenanceData, error: maintenanceError } = await supabase
          .from('maintenance_tasks')
          .select('*');
          
        if (maintenanceError) throw maintenanceError;
        dataToExport.push({ name: 'maintenance_tasks', data: maintenanceData });
      }
      
      if (includeParts) {
        const { data: partsData, error: partsError } = await supabase
          .from('parts_inventory')
          .select('*');
          
        if (partsError) throw partsError;
        dataToExport.push({ name: 'parts_inventory', data: partsData });
      }
      
      if (includeInterventions) {
        const { data: interventionsData, error: interventionsError } = await supabase
          .from('interventions')
          .select('*');
          
        if (interventionsError) throw interventionsError;
        dataToExport.push({ name: 'interventions', data: interventionsData });
      }
      
      // Format the filename with date
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss', { locale: fr });
      const filename = `agri_erp_export_${timestamp}`;
      
      // Create blob based on export type
      let blob;
      let type;
      
      if (exportType === 'json') {
        // Export as JSON
        const jsonData = {};
        dataToExport.forEach(item => {
          jsonData[item.name] = item.data;
        });
        
        blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        type = 'application/json';
      } else {
        // Export as CSV
        const csvContent = dataToExport.map(item => {
          if (item.data.length === 0) return `# ${item.name}\n# No data\n\n`;
          
          const headers = Object.keys(item.data[0]).join(',');
          const rows = item.data.map(row => 
            Object.values(row).map(value => 
              typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
            ).join(',')
          ).join('\n');
          
          return `# ${item.name}\n${headers}\n${rows}\n\n`;
        }).join('');
        
        blob = new Blob([csvContent], { type: 'text/csv' });
        type = 'text/csv';
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.${exportType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Export des données terminé');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Échec de l\'export des données');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection 
      title="Data Export" 
      description="Export your data for backup or reporting purposes"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
          <Download className="h-8 w-8 text-secondary-foreground" />
        </div>
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="flex gap-4">
              <Card className={`cursor-pointer border-2 ${exportType === 'csv' ? 'border-primary' : 'border-border'}`} onClick={() => setExportType('csv')}>
                <CardContent className="p-4 flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">CSV</p>
                    <p className="text-xs text-muted-foreground">Compatible with spreadsheets</p>
                  </div>
                </CardContent>
              </Card>
              <Card className={`cursor-pointer border-2 ${exportType === 'json' ? 'border-primary' : 'border-border'}`} onClick={() => setExportType('json')}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Database className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">JSON</p>
                    <p className="text-xs text-muted-foreground">For data processing</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Data to Export</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="export-equipment" 
                  checked={includeEquipment}
                  onCheckedChange={(checked) => setIncludeEquipment(checked === true)}
                />
                <Label htmlFor="export-equipment" className="font-normal">Equipment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="export-maintenance" 
                  checked={includeMaintenance}
                  onCheckedChange={(checked) => setIncludeMaintenance(checked === true)}
                />
                <Label htmlFor="export-maintenance" className="font-normal">Maintenance Tasks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="export-parts" 
                  checked={includeParts}
                  onCheckedChange={(checked) => setIncludeParts(checked === true)}
                />
                <Label htmlFor="export-parts" className="font-normal">Parts Inventory</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="export-interventions" 
                  checked={includeInterventions}
                  onCheckedChange={(checked) => setIncludeInterventions(checked === true)}
                />
                <Label htmlFor="export-interventions" className="font-normal">Interventions</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date-range">Date Range</Label>
            <Select 
              value={dateRange} 
              onValueChange={(value) => setDateRange(value as any)}
            >
              <SelectTrigger id="date-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="year">Current Year</SelectItem>
                <SelectItem value="month">Current Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleExport} 
            disabled={loading || (!includeEquipment && !includeMaintenance && !includeParts && !includeInterventions)}
            className="mt-4"
          >
            {loading ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
};
