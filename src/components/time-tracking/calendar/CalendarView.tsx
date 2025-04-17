
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const CalendarView: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-6">
          <h3 className="text-lg font-medium">Vue Calendrier</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Visualisez vos sessions de travail dans un calendrier.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
