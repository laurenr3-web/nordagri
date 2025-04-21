
-- Ce fichier représente le schéma initial de la base de données
-- Il servira de référence pour les migrations futures

-- Création d'un table migrations pour suivre les migrations exécutées
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer cette migration initiale
INSERT INTO migrations (name) VALUES ('00000000000000_initial_schema');
