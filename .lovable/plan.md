## Étape 1 + 2 — Migration SQL

Une seule migration qui fait les deux opérations en transaction:

```sql
-- 1. Déplacer les 9 planning_tasks d'Olivier de sa ferme solo vers la bonne ferme
UPDATE public.planning_tasks
SET farm_id = '6b82b215-6603-4ba0-aaa7-3f881801ba02'
WHERE created_by = '56119c65-4616-497a-bb64-debfea59ed62'
  AND farm_id   = '3b5bc8ce-419c-409b-a519-f5fb3583f4c6';

-- 2. Nettoyer la ferme orpheline (vérifié vide côté equipment/maintenance/parts/fuel/points)
DELETE FROM public.farm_members              WHERE farm_id = '3b5bc8ce-419c-409b-a519-f5fb3583f4c6';
DELETE FROM public.farm_settings             WHERE farm_id = '3b5bc8ce-419c-409b-a519-f5fb3583f4c6';
DELETE FROM public.planning_category_importance WHERE farm_id = '3b5bc8ce-419c-409b-a519-f5fb3583f4c6';
DELETE FROM public.farms                     WHERE id      = '3b5bc8ce-419c-409b-a519-f5fb3583f4c6';
```

### Audit préalable (déjà fait)

Ferme orpheline `3b5bc8ce` contient uniquement:
- 9 planning_tasks (à déplacer)
- 1 farm_members (Olivier lui-même), 1 farm_settings, 7 planning_category_importance (à supprimer)
- 0 equipment, maintenance, parts, fuel, points, invitations, locations, manufacturers

Aucune perte de donnée réelle. Après cette migration:
- Laurent et Suzie verront immédiatement les 9 tâches d'Olivier dans Planification.
- Olivier basculera automatiquement sur la ferme partagée (puisque `useFarmId` ne trouvera plus de ferme dont il est owner).

L'étape 3 (correctif `useFarmId.ts` priorité membership) et l'étape 4 (cleanup côté `accept-invitation`) seront faites après dans un message séparé.