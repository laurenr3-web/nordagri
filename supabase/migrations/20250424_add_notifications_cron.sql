
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
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer " || current_setting(''app.notifications_api_key'', true)}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Définir la variable d'environnement pour la clé API des notifications
select set_config('app.notifications_api_key', (select decrypted_secret from vault.decrypted_secrets where name = 'NOTIFICATIONS_API_KEY'), false);

