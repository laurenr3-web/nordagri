
import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const EmptyState: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">Historique des retraits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <Clock className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mt-2">Aucun retrait enregistré pour cette pièce</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
