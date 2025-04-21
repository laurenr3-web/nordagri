
-- Migration pour optimiser la table time_sessions

-- Création d'un index sur user_id et start_time pour accélérer les requêtes
CREATE INDEX IF NOT EXISTS idx_time_sessions_user_start_time 
ON time_sessions (user_id, start_time);

-- Création d'un index sur le status pour filtrer rapidement les sessions actives
CREATE INDEX IF NOT EXISTS idx_time_sessions_status 
ON time_sessions (status);

-- Création d'un index sur journee_id pour regrouper les sessions par journée
CREATE INDEX IF NOT EXISTS idx_time_sessions_journee_id 
ON time_sessions (journee_id);

-- Mettre à jour la table migrations
INSERT INTO migrations (name) VALUES ('20250421000001_optimize_time_sessions');
