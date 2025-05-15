
import React, { useState, useEffect } from 'react';
import { DialogWrapper } from '@/components/ui/dialog-wrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { maintenanceTemplates, MaintenanceTemplateItem } from '@/constants/maintenanceTemplates';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { useEquipment } from '@/hooks/equipment/useEquipment';
import TemplateTab from './TemplateTab';
import CustomTab from './CustomTab';
import { ImportMaintenanceDialogProps, CustomMaintenanceItem } from './types';
import { convertToMaintenanceTasks } from './utils';

const ImportMaintenanceDialog: React.FC<ImportMaintenanceDialogProps> = ({
  isOpen,
  onClose,
  equipmentId: initialEquipmentId,
  equipmentName: initialEquipmentName
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('Tracteur');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | undefined>(initialEquipmentId);
  const [selectedEquipmentName, setSelectedEquipmentName] = useState<string | undefined>(initialEquipmentName);
  const [maintenanceItems, setMaintenanceItems] = useState<(MaintenanceTemplateItem & { selected: boolean })[]>([]);
  const [customItems, setCustomItems] = useState<CustomMaintenanceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("template");
  
  // Fetch real equipment data from Supabase
  const { data: equipmentData, isLoading: isLoadingEquipment } = useEquipment();
  
  // Update maintenance items when the template changes
  useEffect(() => {
    const template = maintenanceTemplates.find(t => t.type === selectedTemplate);
    if (template) {
      setMaintenanceItems(template.items.map(item => ({ ...item, selected: true })));
    }
  }, [selectedTemplate]);
  
  // When receiving an initial equipment, select appropriate template
  useEffect(() => {
    if (initialEquipmentName) {
      if (initialEquipmentName.toLowerCase().includes('tracteur')) {
        setSelectedTemplate('Tracteur');
      } else if (initialEquipmentName.toLowerCase().includes('moissonneus')) {
        setSelectedTemplate('Moissonneuse');
      } else if (initialEquipmentName.toLowerCase().includes('pulvéris')) {
        setSelectedTemplate('Pulvérisateur');
      }
    }
  }, [initialEquipmentId, initialEquipmentName]);
  
  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
  };
  
  const handleEquipmentChange = (value: string) => {
    const equipmentId = parseInt(value, 10);
    const equipment = equipmentData?.find(e => e.id === equipmentId);
    setSelectedEquipmentId(equipmentId);
    setSelectedEquipmentName(equipment?.name);
  };
  
  const toggleMaintenanceItem = (id: string) => {
    setMaintenanceItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleAllMaintenanceItems = (selected: boolean) => {
    setMaintenanceItems(prev => prev.map(item => ({ ...item, selected })));
  };
  
  const toggleAllCustomItems = (selected: boolean) => {
    setCustomItems(prev => prev.map(item => ({ ...item, selected })));
  };
  
  const updateMaintenanceItemInterval = (id: string, interval: number) => {
    setMaintenanceItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, interval } : item
      )
    );
  };
  
  const addCustomItem = () => {
    setCustomItems(prev => [
      ...prev,
      {
        name: '',
        interval_type: 'hours',
        interval: 100,
        category: '',
        description: '',
        priority: 'medium',
        selected: true
      }
    ]);
  };
  
  const removeCustomItem = (index: number) => {
    setCustomItems(prev => prev.filter((_, i) => i !== index));
  };
  
  const updateCustomItem = (index: number, field: keyof CustomMaintenanceItem, value: any) => {
    setCustomItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    );
  };
  
  const handleImport = async () => {
    if (!selectedEquipmentId || !selectedEquipmentName) {
      toast.error('Veuillez sélectionner un équipement');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Combine selected template and custom items
      const selectedTemplateItems = maintenanceItems.filter(item => item.selected);
      const selectedCustomItems = customItems.filter(item => item.selected && item.name.trim() !== '');
      
      if (selectedTemplateItems.length === 0 && selectedCustomItems.length === 0) {
        toast.error('Aucun élément de maintenance sélectionné');
        return;
      }
      
      // Convert all items to maintenance tasks
      const maintenanceTasks = [
        ...convertToMaintenanceTasks(selectedTemplateItems, selectedEquipmentId, selectedEquipmentName),
        ...convertToMaintenanceTasks(selectedCustomItems, selectedEquipmentId, selectedEquipmentName)
      ];
      
      // Use the bulkCreateMaintenance method
      await maintenanceService.bulkCreateMaintenance(maintenanceTasks);
      
      toast.success(`${maintenanceTasks.length} entretiens importés avec succès`);
      onClose();
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de l\'import des entretiens:', error);
      toast.error('Erreur lors de l\'import des entretiens');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <DialogWrapper
      title="Importer entretiens fabricant"
      description="Ajoutez rapidement des entretiens recommandés pour votre équipement"
      open={isOpen}
      onOpenChange={onClose}
    >
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label htmlFor="equipment">Équipement</Label>
          <Select 
            value={selectedEquipmentId?.toString()} 
            onValueChange={handleEquipmentChange}
            disabled={!!initialEquipmentId || isLoadingEquipment}
          >
            <SelectTrigger id="equipment">
              <SelectValue placeholder={isLoadingEquipment ? "Chargement..." : "Sélectionner un équipement"} />
            </SelectTrigger>
            <SelectContent>
              {isLoadingEquipment ? (
                <SelectItem value="loading" disabled>Chargement...</SelectItem>
              ) : equipmentData?.length ? (
                equipmentData.map(equipment => (
                  <SelectItem key={equipment.id} value={equipment.id.toString()}>
                    {equipment.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>Aucun équipement</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="template">Template</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger id="template">
              <SelectValue placeholder="Sélectionner un template" />
            </SelectTrigger>
            <SelectContent>
              {maintenanceTemplates.map(template => (
                <SelectItem key={template.type} value={template.type}>
                  {template.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="template" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="template">Entretiens recommandés</TabsTrigger>
            <TabsTrigger value="custom">Entretiens personnalisés</TabsTrigger>
          </TabsList>
          
          <TabsContent value="template" className="space-y-4">
            <TemplateTab
              maintenanceItems={maintenanceItems}
              toggleMaintenanceItem={toggleMaintenanceItem}
              toggleAllMaintenanceItems={toggleAllMaintenanceItems}
              updateMaintenanceItemInterval={updateMaintenanceItemInterval}
            />
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <CustomTab
              customItems={customItems}
              addCustomItem={addCustomItem}
              removeCustomItem={removeCustomItem}
              updateCustomItem={updateCustomItem}
              toggleAllCustomItems={toggleAllCustomItems}
            />
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleImport} disabled={isLoading}>
            {isLoading ? 'Importation...' : 'Importer les entretiens'}
          </Button>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default ImportMaintenanceDialog;
