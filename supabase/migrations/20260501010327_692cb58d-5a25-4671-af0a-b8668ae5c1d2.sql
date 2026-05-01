REVOKE EXECUTE ON FUNCTION public.has_active_session_on_task(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_session_on_task(uuid) TO authenticated;