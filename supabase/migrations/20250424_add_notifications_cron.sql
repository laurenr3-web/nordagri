
-- Activer les extensions nécessaires
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Créer un job cron pour exécuter la vérification des notifications une fois par jour à 8h du matin
select cron.schedule(
  'daily-notifications-check',
  '0 8 * * *', -- À 8h00 tous les jours
  $$
  select
    net.http_post(
      url:='https://cagmgtmeljxykyngxxmj.supabase.co/functions/v1/send-alerts',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer notif_api_key_CHANGE_ME"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
