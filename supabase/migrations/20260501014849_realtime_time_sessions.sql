-- Enable realtime for time_sessions so the global TimeTrackingButton
-- (bottom bar) reacts when Planning pauses/completes a session.
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_sessions;
