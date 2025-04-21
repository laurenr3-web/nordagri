
# Migrations SQL

Ce dossier contient les migrations SQL qui permettent de versionner et d'appliquer les changements de schéma à la base de données Supabase.

## Structure des fichiers de migration

Les fichiers de migration suivent le format de nommage suivant:
```
YYYYMMDDHHMMSS_description_migration.sql
```

Par exemple: `20250421000001_optimize_time_sessions.sql`

## Comment appliquer les migrations

1. Connectez-vous à votre projet Supabase via l'interface web
2. Allez dans l'éditeur SQL
3. Copiez le contenu du fichier de migration
4. Exécutez le script SQL

Pour un environnement de développement local avec Supabase CLI:

```bash
supabase db push
```

## Comment créer une nouvelle migration

1. Créez un nouveau fichier avec l'horodatage actuel (YYYYMMDDHHMMSS)
2. Ajoutez vos instructions SQL
3. N'oubliez pas d'ajouter une entrée dans la table `migrations`
4. Testez votre migration localement avant de l'appliquer en production
