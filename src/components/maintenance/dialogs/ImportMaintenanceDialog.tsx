import React, { useState, useEffect } from 'react';
import { DialogWrapper } from '@/components/ui/dialog-wrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FileDown, Plus, Trash, Wrench, Filter, Droplets, Settings, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { maintenanceTemplates, MaintenanceTemplateItem } from '@/constants/maintenanceTemplates';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useEquipment } from '@/hooks/equipment/useEquipment';

interface ImportMaintenanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId?: number;
  equipmentName?: string;
}

interface CustomMaintenanceItem extends Omit<MaintenanceTemplateItem, 'id'> {
  id?: string;
  selected: boolean;
}

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

  // Get the appropriate icon based on the category
  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('moteur') || lowerCategory.includes('mécanique')) {
      return <Wrench className="h-4 w-4" />;
    } else if (lowerCategory.includes('filtre')) {
      return <Filter className="h-4 w-4" />;
    } else if (lowerCategory.includes('hydraulique') || lowerCategory.includes('fluid')) {
      return <Droplets className="h-4 w-4" />;
    } else {
      return <Settings className="h-4 w-4" />;
    }
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
        ...selectedTemplateItems.map(item => ({
          title: item.name,
          equipment: selectedEquipmentName,
          equipmentId: selectedEquipmentId,
          type: item.category.toLowerCase() as any,
          status: 'scheduled' as const,
          priority: item.priority as any,
          dueDate: new Date(Date.now() + item.interval * (
            item.interval_type === 'hours' ? 3600000 : 
            item.interval_type === 'months' ? 2592000000 : 
            86400000 // km - we use an arbitrary date for km
          )),
          engineHours: item.interval_type === 'hours' ? item.interval : 0,
          assignedTo: '',
          notes: item.description,
          trigger_unit: item.interval_type === 'kilometers' ? 'kilometers' : 
                        item.interval_type === 'hours' ? 'hours' : 'none',
          trigger_hours: item.interval_type === 'hours' ? item.interval : undefined,
          trigger_kilometers: item.interval_type === 'kilometers' ? item.interval : undefined
        })),
        ...selectedCustomItems.map(item => ({
          title: item.name,
          equipment: selectedEquipmentName,
          equipmentId: selectedEquipmentId,
          type: item.category.toLowerCase() as any,
          status: 'scheduled' as const,
          priority: item.priority as any,
          dueDate: new Date(Date.now() + item.interval * (
            item.interval_type === 'hours' ? 3600000 : 
            item.interval_type === 'months' ? 2592000000 : 
            86400000 // km
          )),
          engineHours: item.interval_type === 'hours' ? item.interval : 0,
          assignedTo: '',
          notes: item.description,
          trigger_unit: item.interval_type === 'kilometers' ? 'kilometers' : 
                        item.interval_type === 'hours' ? 'hours' : 'none',
          trigger_hours: item.interval_type === 'hours' ? item.interval : undefined,
          trigger_kilometers: item.interval_type === 'kilometers' ? item.interval : undefined
        }))
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
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-muted-foreground">
                {maintenanceItems.filter(i => i.selected).length} entretiens sélectionnés sur {maintenanceItems.length}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleAllMaintenanceItems(true)}
                >
                  <Check className="h-4 w-4 mr-1" /> Tout sélectionner
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleAllMaintenanceItems(false)}
                >
                  Tout désélectionner
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {maintenanceItems.map((item) => (
                  <Card key={item.id} className={`overflow-hidden transition-colors ${item.selected ? 'border-primary/30' : 'border-muted'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          id={`check-${item.id}`}
                          checked={item.selected}
                          onCheckedChange={() => toggleMaintenanceItem(item.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <Label 
                              htmlFor={`check-${item.id}`}
                              className="font-medium text-base flex items-center gap-2"
                            >
                              {getCategoryIcon(item.category)}
                              {item.name}
                            </Label>
                            <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'outline'}>
                              {item.priority === 'high' ? 'Critique' : item.priority === 'medium' ? 'Important' : 'Normal'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="bg-muted/50">
                              {item.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                            <Label htmlFor={`interval-${item.id}`} className="whitespace-nowrap">Intervalle:</Label>
                            <Input 
                              id={`interval-${item.id}`}
                              type="number" 
                              value={item.interval} 
                              onChange={(e) => updateMaintenanceItemInterval(item.id, parseInt(e.target.value) || 0)}
                              className="w-24 h-8"
                              disabled={!item.selected}
                            />
                            <Badge variant="secondary" className="ml-1">
                              {item.interval_type === 'hours' ? 'Heures' : 
                               item.interval_type === 'months' ? 'Mois' : 'Kilomètres'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-muted-foreground">
                {customItems.filter(i => i.selected && i.name).length} entretiens personnalisés
              </div>
              {customItems.length > 0 && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toggleAllCustomItems(true)}
                  >
                    <Check className="h-4 w-4 mr-1" /> Tout sélectionner
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toggleAllCustomItems(false)}
                  >
                    Tout désélectionner
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {customItems.map((item, index) => (
                  <Card key={index} className={`overflow-hidden transition-colors ${item.selected ? 'border-primary/30' : 'border-muted'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          id={`custom-${index}`}
                          checked={item.selected}
                          onCheckedChange={(checked) => updateCustomItem(index, 'selected', !!checked)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <Label htmlFor={`custom-name-${index}`} className="mb-1 block">Nom</Label>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeCustomItem(index)}
                              className="h-8 w-8 text-destructive hover:text-destructive/90"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input 
                            id={`custom-name-${index}`}
                            value={item.name}
                            onChange={(e) => updateCustomItem(index, 'name', e.target.value)}
                            placeholder="Nom de l'entretien"
                            disabled={!item.selected}
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`custom-category-${index}`}>Catégorie</Label>
                              <Input 
                                id={`custom-category-${index}`}
                                value={item.category}
                                onChange={(e) => updateCustomItem(index, 'category', e.target.value)}
                                placeholder="Ex: Moteur, Filtres..."
                                disabled={!item.selected}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`custom-priority-${index}`}>Priorité</Label>
                              <Select 
                                value={item.priority}
                                onValueChange={(value) => updateCustomItem(index, 'priority', value)}
                                disabled={!item.selected}
                              >
                                <SelectTrigger id={`custom-priority-${index}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Basse</SelectItem>
                                  <SelectItem value="medium">Moyenne</SelectItem>
                                  <SelectItem value="high">Haute</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`custom-interval-${index}`}>Intervalle</Label>
                              <Input 
                                id={`custom-interval-${index}`}
                                type="number"
                                value={item.interval}
                                onChange={(e) => updateCustomItem(index, 'interval', parseInt(e.target.value) || 0)}
                                disabled={!item.selected}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`custom-interval-type-${index}`}>Type d'intervalle</Label>
                              <Select 
                                value={item.interval_type}
                                onValueChange={(value: any) => updateCustomItem(index, 'interval_type', value)}
                                disabled={!item.selected}
                              >
                                <SelectTrigger id={`custom-interval-type-${index}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hours">Heures</SelectItem>
                                  <SelectItem value="months">Mois</SelectItem>
                                  <SelectItem value="kilometers">Kilomètres</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <Label htmlFor={`custom-description-${index}`}>Description</Label>
                            <Textarea 
                              id={`custom-description-${index}`}
                              value={item.description}
                              onChange={(e) => updateCustomItem(index, 'description', e.target.value)}
                              placeholder="Description détaillée de l'entretien"
                              disabled={!item.selected}
                              className="h-20"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button onClick={addCustomItem} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un entretien personnalisé
                </Button>
              </div>
            </ScrollArea>

            {customItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun entretien personnalisé ajouté</p>
                <p className="text-sm">Cliquez sur le bouton ci-dessous pour ajouter un entretien</p>
                <Button onClick={addCustomItem} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un entretien personnalisé
                </Button>
              </div>
            )}
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
