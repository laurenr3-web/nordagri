
# Guide des Commandes

## Commandes NPM/Yarn

### Installation
```bash
# Installation des dépendances
npm install
# ou
yarn install
```

### Développement
```bash
# Démarrage du serveur de développement
npm run dev
# ou
yarn dev

# Linting
npm run lint
# ou
yarn lint

# Type checking
npm run typecheck
# ou
yarn typecheck
```

### Tests
```bash
# Exécution des tests
npm run test
# ou
yarn test

# Exécution des tests avec surveillance des fichiers
npm run test:watch
# ou
yarn test:watch

# Test de couverture
npm run test:coverage
# ou
yarn test:coverage

# Test d'un fichier spécifique
npx vitest run src/tests/fuelLog.test.ts
# ou
yarn vitest run src/tests/fuelLog.test.ts
```

### Build
```bash
# Construction pour production
npm run build
# ou
yarn build

# Prévisualisation de la build
npm run preview
# ou
yarn preview
```

### Analyse
```bash
# Analyse des dépendances
npm run analyze-deps
# ou
yarn analyze-deps

# Rapport de couverture de code
npm run analyze-coverage
# ou
yarn analyze-coverage
```

## Commandes Supabase

### Installation de CLI Supabase
```bash
npm install -g supabase
```

### Configuration locale
```bash
# Démarrage de Supabase en local
supabase start

# Arrêt de Supabase
supabase stop

# Réinitialiser la base de données locale
supabase db reset
```

### Migration et Schéma
```bash
# Générer une migration à partir des changements
supabase db diff -f nom_migration

# Appliquer les migrations
supabase db push

# Exporter le schéma actuel
supabase db dump > schema.sql
```

### Fonctions et déclencheurs
```bash
# Créer une nouvelle fonction edge
supabase functions new nom_fonction

# Déployer une fonction
supabase functions deploy nom_fonction

# Journaux des fonctions
supabase functions logs nom_fonction
```

## Commandes Git

```bash
# Cloner le repository
git clone https://github.com/organisation/optifield.git

# Créer une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite

# Ajouter des modifications
git add .

# Committer des changements
git commit -m "feat: ajouter nouvelle fonctionnalité"

# Pousser les changements
git push origin feature/nouvelle-fonctionnalite
```

## Commandes SQL (Supabase)

### Requêtes courantes
```sql
-- Sélectionner tous les équipements
SELECT * FROM equipment ORDER BY name;

-- Obtenir les tâches de maintenance à venir
SELECT * FROM maintenance_tasks 
WHERE status = 'scheduled' AND due_date > NOW()
ORDER BY due_date;

-- Calculer le temps total par équipement
SELECT equipment_id, SUM(duration) as total_hours
FROM time_sessions
WHERE status = 'completed'
GROUP BY equipment_id
ORDER BY total_hours DESC;

-- Obtenir les pièces avec stock faible
SELECT * FROM parts_inventory
WHERE quantity <= reorder_threshold;
```

### Fonctions utiles
```sql
-- Créer une nouvelle fonction
CREATE OR REPLACE FUNCTION calculate_equipment_usage(equipment_id_param INT)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT SUM(duration)
    FROM time_sessions
    WHERE equipment_id = equipment_id_param
    AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql;

-- Utilisation de la fonction
SELECT calculate_equipment_usage(1);
```

### Politiques RLS
```sql
-- Ajouter une politique RLS
CREATE POLICY "Utilisateurs peuvent voir leurs équipements"
ON equipment
FOR SELECT
USING (owner_id = auth.uid());
```
