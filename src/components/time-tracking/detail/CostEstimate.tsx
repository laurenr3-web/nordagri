
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CostEstimateProps {
  cost: number;
}

export const CostEstimate = ({ cost }: CostEstimateProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Coût estimé</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{cost}€</p>
        <p className="text-sm text-muted-foreground">Basé sur le taux horaire standard</p>
      </CardContent>
    </Card>
  );
};
