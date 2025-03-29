
import React from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Part } from '@/types/Part';
import PartBasicInfo from './details/PartBasicInfo';
import PartImage from './details/PartImage';
import PartInventoryInfo from './details/PartInventoryInfo';
import PartCompatibility from './details/PartCompatibility';
import PartReorderInfo from './details/PartReorderInfo';
import PartPriceComparison from './PartPriceComparison';
import PartActions from './details/PartActions';
import { ensureNumber } from '@/utils/typeAdapters';

interface PartDetailsExtendedProps {
  part: Part;
  onClose: () => void;
  onEdit: () => void;
  onOrder: () => void;
  onDelete: () => void;
}

const PartDetailsExtended: React.FC<PartDetailsExtendedProps> = ({
  part,
  onClose,
  onEdit,
  onOrder,
  onDelete
}) => {
  const [activeTab, setActiveTab] = React.useState('details');

  // Déterminer si le stock est bas en fonction du point de réapprovisionnement
  const stock = ensureNumber(part.stock);
  const reorderPoint = ensureNumber(part.reorderPoint || part.minimumStock);
  const isLowStock = stock <= reorderPoint;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'inventaire
        </Button>
        <PartActions 
          part={part}
          onEdit={onEdit}
          onOrder={onOrder}
          onDelete={onDelete}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold">{part.name}</CardTitle>
                <CardDescription>Référence: {part.partNumber || part.reference}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={stock > 0 ? "outline" : "destructive"}>
                  {stock > 0 ? "En stock" : "Rupture de stock"}
                </Badge>
                {isLowStock && stock > 0 && (
                  <Badge variant="secondary" className="flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Stock bas
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="compatibility">Compatibilité</TabsTrigger>
                  <TabsTrigger value="pricing">Comparaison de prix</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PartBasicInfo part={part} />
                    <PartInventoryInfo part={part} />
                  </div>
                  
                  <Separator />
                  
                  <PartReorderInfo part={part} onOrder={onOrder} />
                </TabsContent>
                
                <TabsContent value="compatibility" className="pt-4">
                  <PartCompatibility 
                    compatibility={part.compatibility || part.compatibleWith || []} 
                  />
                </TabsContent>
                
                <TabsContent value="pricing" className="pt-4">
                  <PartPriceComparison 
                    partReference={part.partNumber || part.reference || ''}
                    partName={part.name}
                    partManufacturer={part.manufacturer}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <PartImage part={part} />
        </div>
      </div>
    </div>
  );
};

export default PartDetailsExtended;
