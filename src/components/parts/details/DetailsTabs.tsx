
import React, { lazy, memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Part } from '@/types/Part';
import PartBasicInfo from './PartBasicInfo';
import PartInventoryInfo from './PartInventoryInfo';
import PartCompatibility from './PartCompatibility';
import PartReorderInfo from './PartReorderInfo';

// Utilisation de React.lazy pour charger le composant de manière asynchrone
const WithdrawalHistory = lazy(() => import('./WithdrawalHistory'));

interface DetailsTabsProps {
  part: Part;
  activeTab: string;
  onTabChange: (value: string) => void;
}

// Utiliser React.memo pour éviter les re-rendus inutiles
const DetailsTabs: React.FC<DetailsTabsProps> = memo(({ 
  part, 
  activeTab, 
  onTabChange 
}) => {
  // Validation des props
  if (!part || !part.id) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Erreur: Informations de pièce invalides
      </div>
    );
  }
  
  console.log('DetailsTabs rendered with activeTab:', activeTab, 'and part:', part.id);
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="details">Détails</TabsTrigger>
        <TabsTrigger value="history">Historique des retraits</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-6 mt-6">
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PartBasicInfo part={part} />
          <PartInventoryInfo part={part} />
        </div>

        <PartCompatibility compatibility={part.compatibility} />

        <PartReorderInfo part={part} />
      </TabsContent>
      
      <TabsContent value="history" className="mt-6">
        <React.Suspense 
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          }
        >
          <WithdrawalHistory part={part} />
        </React.Suspense>
      </TabsContent>
    </Tabs>
  );
});

DetailsTabs.displayName = 'DetailsTabs';

export default DetailsTabs;
