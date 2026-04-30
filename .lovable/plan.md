# Ajouter "Prochaine vérification" aux Points à surveiller

Permettre de planifier facilement la prochaine revue d'un point (ex : « revoir dans 4 jours ») sans alourdir l'interface.

## 1. Base de données

Migration sur la table `points` :
- Ajouter colonne `next_check_at timestamptz NULL`
- Index partiel pour requêtes dashboard : `CREATE INDEX idx_points_next_check ON points(farm_id, next_check_at) WHERE next_check_at IS NOT NULL AND status <> 'resolved';`

Mise à jour du type TypeScript `Point` dans `src/types/Point.ts` (ajout `next_check_at: string | null`).

## 2. Saisie dans le formulaire d'événement

Dans `src/components/points/AddEventDialog.tsx`, ajouter un bloc optionnel sous la note :

- Checkbox « 🕒 À revoir dans » (off par défaut)
- Quand cochée : 4 boutons rapides (1, 3, 7, 14 jours) + petit input numérique custom (1–60)
- À la soumission, si activé : mettre à jour `points.next_check_at = now() + N jours` via une mutation séparée (en plus de l'insertion d'event)

Ajouter une mutation `useUpdatePointNextCheck` dans `src/hooks/points/usePointMutations.ts` (update `next_check_at`, invalidation des queries `points` + `dashboard`).

## 3. Affichage dans le détail d'un point

Dans `PointDetailDialog.tsx`, sous les badges de l'en-tête, afficher si `next_check_at` est défini et le point n'est pas résolu :
- Date future : « 🕒 À vérifier le 12 mai » (ambre)
- Aujourd'hui : « 🔴 À vérifier aujourd'hui » (rouge)
- Passée : « ⚠️ Vérification en retard de N j » (rouge)

Ajouter un petit bouton « ✕ retirer » à côté pour effacer la prochaine vérif.

## 4. Affichage dans la liste (PointCard)

Dans `PointCard.tsx`, ajouter un badge compact à côté des badges priorité/statut quand `next_check_at` est défini :
- Bientôt (≤ 7 j à venir) : badge ambre « 🕒 dans Nj »
- Aujourd'hui : badge rouge « 🔴 à vérifier »
- Dépassé : badge rouge « ⚠️ retard Nj »

Helper centralisé `nextCheckState(next_check_at)` dans `pointHelpers.ts` retournant `{ kind: 'soon'|'today'|'overdue'|'none', label, badgeClass }`.

## 5. Dashboard — section « À vérifier aujourd'hui »

Étendre `useCheckTodayData.ts` :
- Nouveau champ `dueChecksCount` = nombre de points avec `next_check_at <= fin de journée` et `status <> 'resolved'`
- Requête additionnelle parallèle (`select id, count: exact, head: true`)

Le widget « À vérifier aujourd'hui » (côté Dashboard) inclura ce compte (à fusionner avec les points oubliés ou affiché en ligne séparée — à confirmer côté UI existante du widget).

## 6. UX

- Aucun calendrier complet : uniquement chips 1/3/7/14 + input numérique
- Champ totalement optionnel
- Réutilisable pour de futurs événements (chaque nouvel event peut reprogrammer)
- Mobile-first : boutons larges, pas de scroll horizontal

## Détails techniques

- Migration Supabase pure schéma (ALTER TABLE + INDEX). Pas de RLS à toucher : la colonne hérite des policies existantes de `points`.
- `src/integrations/supabase/types.ts` se régénère automatiquement.
- Les mutations invalident `['points', farmId]`, `['point', id]`, `['dashboard', 'checkToday', farmId]`.
- Helper de date : utiliser `date-fns` déjà dans le projet pour formater « le 12 mai ».
- Pas de modification des RPC stats existantes.

## Fichiers touchés

- nouveau : `supabase/migrations/<timestamp>_add_points_next_check_at.sql`
- modifié : `src/types/Point.ts`
- modifié : `src/components/points/pointHelpers.ts` (helper `nextCheckState`)
- modifié : `src/components/points/AddEventDialog.tsx` (bloc « À revoir dans »)
- modifié : `src/hooks/points/usePointMutations.ts` (mutation `useUpdatePointNextCheck`)
- modifié : `src/components/points/PointCard.tsx` (badge)
- modifié : `src/components/points/PointDetailDialog.tsx` (ligne d'info + bouton retirer)
- modifié : `src/hooks/dashboard/useCheckTodayData.ts` (compte `dueChecksCount`)
- modifié : widget dashboard consommant `useCheckTodayData` pour afficher le compte
