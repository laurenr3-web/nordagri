import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play } from 'lucide-react';
import { TimeEntryCard } from '@/components/time-tracking/TimeEntryCard';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TimeEntryForm } from '@/components/time-tracking/TimeEntryForm';
import { Skeleton } from '@/components/ui/skeleton';

interface EquipmentTimeTrackingProps {
  equipment: any;
}

const EquipmentTimeTracking: React.FC<EquipmentTimeTrackingProps> = ({ equipment }) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  
  // Get user ID on load
  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUserId(data.session.user.id);
      }
    };
    
    fetchUserId();
  }, []);
  
  // Load time entries for this equipment
  useEffect(() => {
    if (userId && equipment?.id) {
      fetchTimeEntries();
    }
  }, [userId, equipment]);
  
  // Fetch time entries
  const fetchTimeEntries = async () => {
    if (!userId || !equipment?.id) return;
    
    setIsLoading(true);
    try {
      const equipmentId = typeof equipment.id === 'string' ? parseInt(equipment.id, 10) : equipment.id;
      
      const data = await timeTrackingService.getTimeEntries({
        userId,
        equipmentId
      });
      
      setTimeEntries(data);
      
      // Calculate total time
      const total = data.reduce((sum, entry) => {
        const start = new Date(entry.start_time);
        const end = entry.end_time ? new Date(entry.end_time) : new Date();
        const diffMs = end.getTime() - start.getTime();
        const hours = diffMs / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      
      setTotalHours(total);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      toast.error("Could not load time sessions for this equipment");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start a new time session
  const handleStartTimeEntry = async (data: any) => {
    if (!userId) return;
    
    try {
      const equipmentId = typeof equipment.id === 'string' ? parseInt(equipment.id, 10) : equipment.id;
      
      // Pre-fill equipment from current page
      await timeTrackingService.startTimeEntry(userId, {
        ...data,
        equipment_id: equipmentId
      });
      
      setIsFormOpen(false);
      toast.success("Time session started");
      fetchTimeEntries();
    } catch (error) {
      console.error("Error starting time tracking:", error);
      toast.error("Could not start session");
    }
  };
  
  // Resume a paused session
  const handleResumeTimeEntry = async (entryId: string) => {
    try {
      await timeTrackingService.resumeTimeEntry(entryId);
      toast.success("Session resumed");
      fetchTimeEntries();
    } catch (error) {
      console.error("Error resuming time tracking:", error);
      toast.error("Could not resume session");
    }
  };
  
  // Delete a time entry
  const handleDeleteTimeEntry = async (entryId: string) => {
    try {
      await timeTrackingService.deleteTimeEntry(entryId);
      toast.success("Session deleted");
      fetchTimeEntries();
    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast.error("Could not delete session");
    }
  };
  
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Time Tracking</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Clock className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>
      
      {/* Summary card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800">Total time on this equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-700">
            {isLoading ? <Skeleton className="h-10 w-24" /> : `${totalHours.toFixed(2)} hours`}
          </div>
          <p className="text-blue-600 mt-1">
            Across {timeEntries.length} sessions
          </p>
        </CardContent>
      </Card>
      
      {/* List of time entries */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Session History</h3>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="p-4">
                    <Skeleton className="h-6 w-24 mb-3" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          timeEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeEntries.map((entry) => (
                <TimeEntryCard
                  key={entry.id}
                  entry={entry}
                  onResume={handleResumeTimeEntry}
                  onDelete={handleDeleteTimeEntry}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md bg-gray-50">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2">No sessions recorded</h3>
              <p className="text-gray-500 mb-4">
                You haven't recorded any time for this equipment yet.
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Play className="h-4 w-4 mr-2" />
                Start a session
              </Button>
            </div>
          )
        )}
      </div>
      
      {/* Modal for creating a new session */}
      <TimeEntryForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleStartTimeEntry}
      />
    </div>
  );
};

export default EquipmentTimeTracking;
