
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash } from 'lucide-react';
import { CustomMaintenanceItemProps } from './types';

const CustomMaintenanceItem: React.FC<CustomMaintenanceItemProps> = ({
  item,
  index,
  updateCustomItem,
  removeCustomItem
}) => {
  return (
    <Card className={`overflow-hidden transition-colors ${item.selected ? 'border-primary/30' : 'border-muted'}`}>
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
  );
};

export default CustomMaintenanceItem;
