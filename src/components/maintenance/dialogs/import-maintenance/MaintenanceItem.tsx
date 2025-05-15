
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MaintenanceItemProps } from './types';
import { getCategoryIcon } from './utils';

const MaintenanceItem: React.FC<MaintenanceItemProps> = ({
  item,
  toggleMaintenanceItem,
  updateMaintenanceItemInterval
}) => {
  return (
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
  );
};

export default MaintenanceItem;
