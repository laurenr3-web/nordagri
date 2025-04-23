
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type Props = {
  isLoading: boolean;
  monthly: number;
  biWeekly: number;
};

const PayPeriodSummary: React.FC<Props> = ({ isLoading, monthly, biWeekly }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base">Période de paie</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Mensuelle</p>
          {isLoading ? (
            <p className="text-lg font-medium">Chargement...</p>
          ) : (
            <p className="text-lg font-medium">{monthly.toFixed(1)} heures</p>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Bi-hebdomadaire</p>
          {isLoading ? (
            <p className="text-lg font-medium">Chargement...</p>
          ) : (
            <p className="text-lg font-medium">{biWeekly.toFixed(1)} heures</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default PayPeriodSummary;
