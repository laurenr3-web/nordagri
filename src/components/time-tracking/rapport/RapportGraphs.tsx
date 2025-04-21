
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TimeDistributionChart } from "./TimeDistributionChart";
import { TopEquipmentList } from "./TopEquipmentList";

type RapportGraphsProps = {
  distribution: any;
  isDistributionLoading: boolean;
  equipment: any;
  isEquipmentLoading: boolean;
};

const RapportGraphs: React.FC<RapportGraphsProps> = ({
  distribution,
  isDistributionLoading,
  equipment,
  isEquipmentLoading,
}) => (
  <div className="grid md:grid-cols-2 gap-6 mt-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Répartition par type de tâche</CardTitle>
      </CardHeader>
      <CardContent>
        <TimeDistributionChart data={distribution} isLoading={isDistributionLoading} />
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Équipements les plus utilisés</CardTitle>
      </CardHeader>
      <CardContent>
        <TopEquipmentList data={equipment} isLoading={isEquipmentLoading} />
      </CardContent>
    </Card>
  </div>
);

export default RapportGraphs;
