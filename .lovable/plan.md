## Filtre période en menu déroulant — Heures des tâches

Ajouter un filtre de période sous forme de **Select déroulant** (Aujourd'hui · 7 jours · 30 jours · Tous), à côté du filtre par personne.

### Changements

**1. `src/hooks/time-tracking/useTaskHoursLast7Days.ts`**
- Ajouter un paramètre `range: 'today' | '7d' | '30d' | 'all'` (défaut `'7d'`).
- Calculer `since` selon la période :
  - `today` → début de journée locale (00:00)
  - `7d` → maintenant − 7 j
  - `30d` → maintenant − 30 j
  - `all` → pas de filtre `gte`
- Inclure `range` dans la `queryKey`.

**2. `src/components/time-tracking/statistics/TaskHoursTab.tsx`**
- Ajouter `const [range, setRange] = useState<'today'|'7d'|'30d'|'all'>('7d')`.
- Passer `range` au hook.
- Ajouter un second `Select` à côté de celui des personnes :
  - Trigger compact (`h-9 w-[160px]`), libellé "Période".
  - Items : Aujourd'hui / 7 derniers jours / 30 derniers jours / Tout l'historique.
- Mettre à jour dynamiquement les libellés :
  - Carte résumé "Heures totales (…)" et titre "Détail par tâche — …" reflètent la période choisie.
- Layout `flex flex-wrap gap-2` pour rester mobile-friendly (pas de scroll horizontal).
