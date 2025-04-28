
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Package2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Equipment } from '@/services/supabase/equipmentService';
import { Skeleton } from '@/components/ui/skeleton';

interface EquipmentCompatiblePartsProps {
  equipment: Equipment;
}

const EquipmentCompatibleParts: React.FC<EquipmentCompatiblePartsProps> = ({ equipment }) => {
  // Charger toutes les pièces compatibles avec cet équipement
  const { data: compatibleParts, isLoading } = useQuery({
    queryKey: ['equipment-parts', equipment.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parts_inventory')
        .select('id, name, part_number, quantity, unit_price, category')
        .contains('compatible_with', [equipment.id]);
        
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Pièces compatibles</CardTitle>
          </div>
          <Badge variant="secondary">
            {compatibleParts?.length || 0} pièce(s)
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {compatibleParts && compatibleParts.length > 0 ? (
          <div className="space-y-4">
            {compatibleParts.map((part) => (
              <div 
                key={part.id} 
                className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Package2 className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">{part.name}</h4>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>Réf: {part.part_number}</span>
                    {part.category && (
                      <Badge variant="outline" className="ml-2">
                        {part.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant={part.quantity > 0 ? "success" : "destructive"}>
                    Stock: {part.quantity}
                  </Badge>
                  {part.unit_price && (
                    <span className="text-sm font-medium">
                      {part.unit_price.toFixed(2)} €
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Aucune pièce compatible enregistrée pour cet équipement.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentCompatibleParts;
