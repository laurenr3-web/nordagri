
import * as queries from './queries';
import * as mutations from './mutations';
import * as analytics from './analytics';

export const timeTrackingService = {
  ...queries,
  ...mutations,
  ...analytics
};
