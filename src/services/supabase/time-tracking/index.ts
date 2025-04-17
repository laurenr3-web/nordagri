
import { taskTypeService } from './taskTypeService';
import { timeEntryQueries } from './timeEntryQueries';
import { timeEntryOperations } from './timeEntryOperations';
import { TimeEntry, TimeEntryTaskType, TimeEntryStatus, TimeSpentByEquipment } from '@/hooks/time-tracking/types';
import { StartTimeEntryData, TimeEntriesFilter } from './types';

/**
 * Service for time tracking management using the time_sessions table
 */
export const timeTrackingService = {
  // Task type methods
  getTaskTypes: taskTypeService.getTaskTypes,

  // Query methods
  getActiveTimeEntry: timeEntryQueries.getActiveTimeEntry,
  getTimeEntries: timeEntryQueries.getTimeEntries,
  getTimeEntryById: timeEntryQueries.getTimeEntryById,
  getTimeEntriesByIntervention: timeEntryQueries.getTimeEntriesByIntervention,
  getTimeEntriesByJourneeId: timeEntryQueries.getTimeEntriesByJourneeId,
  getTimeSpentByEquipment: timeEntryQueries.getTimeSpentByEquipment,

  // Operation methods
  deleteTimeEntry: timeEntryOperations.deleteTimeEntry,
  startTimeEntry: timeEntryOperations.startTimeEntry,
  stopTimeEntry: timeEntryOperations.stopTimeEntry,
  pauseTimeEntry: timeEntryOperations.pauseTimeEntry,
  resumeTimeEntry: timeEntryOperations.resumeTimeEntry,
  updateTimeEntry: timeEntryOperations.updateTimeEntry,
};
