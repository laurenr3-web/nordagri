
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useTopEquipment } from '@/hooks/time-tracking/useTopEquipment';

export interface TopEquipmentListProps {
  month: Date;
}

export function TopEquipmentList({ month }: TopEquipmentListProps) {
  const { data, isLoading, error } = useTopEquipment(month);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Équipements les plus utilisés</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement des données...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Équipements les plus utilisés</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <div className="text-center text-muted-foreground">
            <p>Une erreur est survenue lors du chargement des données.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Équipements les plus utilisés</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <div className="text-center text-muted-foreground">
            <p>Aucun équipement utilisé durant cette période</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Équipements les plus utilisés</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.map((equipment) => (
            <Card key={equipment.id} className="overflow-hidden border-0 shadow-sm">
              <div className="bg-primary/5 px-4 py-3 border-b flex justify-between items-center">
                <h3 className="font-medium text-sm truncate">{equipment.name}</h3>
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                  {equipment.hours.toFixed(1)}h
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">{equipment.location || 'Emplacement non spécifié'}</p>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
