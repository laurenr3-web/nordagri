
import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HoursSummary } from '@/hooks/time-tracking/useTimeStatistics';
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface HoursSummaryCardsProps {
  summary: HoursSummary;
  isLoading: boolean;
}

const HoursSummaryCards: React.FC<HoursSummaryCardsProps> = ({ summary, isLoading }) => {
  const cards = [
    {
      title: 'Cette semaine',
      value: summary.week,
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      title: 'Ce mois',
      value: summary.month,
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      title: 'Ce trimestre',
      value: summary.quarter,
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className={`border ${card.color}`}>
          <CardContent className="p-4 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold">{card.value.toFixed(2)}h</h3>
            </div>
            <div className={`p-2 rounded-full ${card.color} bg-opacity-20`}>
              {card.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export { HoursSummaryCards };
export default memo(HoursSummaryCards);
