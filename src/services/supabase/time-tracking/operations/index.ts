
import { deleteTimeEntry } from './deleteTimeEntry';
import { startTimeEntry } from './startTimeEntry';
import { stopTimeEntry } from './stopTimeEntry';
import { pauseTimeEntry } from './pauseTimeEntry';
import { resumeTimeEntry } from './resumeTimeEntry';
import { updateTimeEntry } from './updateTimeEntry';

/**
 * Operations for time entry management
 */
export const timeEntryOperations = {
  deleteTimeEntry,
  startTimeEntry,
  stopTimeEntry,
  pauseTimeEntry,
  resumeTimeEntry,
  updateTimeEntry
};
