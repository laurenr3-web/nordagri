
import { Card, CardContent } from "@/components/ui/card"

interface TimeTrackingStatsProps {
  stats: {
    totalToday: number;
    totalWeek: number;
    totalMonth: number;
  };
  isLoading?: boolean;
}

export function TimeTrackingStats({ stats, isLoading }: TimeTrackingStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-muted-foreground mb-2">Time Today</h3>
          <p className="text-3xl font-bold">{stats.totalToday.toFixed(1)} h</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-muted-foreground mb-2">Time This Week</h3>
          <p className="text-3xl font-bold">{stats.totalWeek.toFixed(1)} h</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-muted-foreground mb-2">Time This Month</h3>
          <p className="text-3xl font-bold">{stats.totalMonth.toFixed(1)} h</p>
        </CardContent>
      </Card>
    </div>
  )
}
