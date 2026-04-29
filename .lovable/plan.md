## Objectif

Dans l'onglet **Tâches terminées**, rendre les cartes de stats **Critiques**, **Importantes** et **En retard** cliquables pour filtrer la liste, et garder **Terminées** comme bouton "tout voir" (réinitialise le filtre).

## Comportement

- Clic sur **Critiques** → seules les tâches de priorité `critical` apparaissent dans la liste groupée par jour.
- Clic sur **Importantes** → seules les tâches `important`.
- Clic sur **En retard** → seules les tâches avec `wasOverdue = true` (toutes priorités).
- Clic sur **Terminées** (ou re-clic sur le filtre actif) → désactive le filtre, retour à toutes les tâches.
- Le filtre se combine avec ceux déjà existants : période (Aujourd'hui / 7 j / 30 j) et employé.
- Les compteurs des `StatCard` continuent d'afficher les totaux **avant** filtre par priorité (sinon la carte active tomberait à son propre nombre, mais les autres deviendraient 0). Ils restent calculés sur `filtered` (période + employé).
- Indicateur visuel : la carte active reçoit une bordure / ring de la couleur de sa tonalité + un focus ring; les autres restent en aspect normal.
- Quand un filtre est actif, afficher un petit lien **"Effacer le filtre"** au-dessus de la liste.
- Si aucune tâche ne correspond, le message "Aucune tâche terminée…" est adapté en "Aucune tâche correspondant à ce filtre."

## Changements techniques

Fichier touché : `src/components/planning/CompletedTasksView.tsx`

1. Ajouter un état `priorityFilter: 'all' | 'critical' | 'important' | 'overdue'` (par défaut `'all'`).
2. Dériver `displayed = filtered` filtré par `priorityFilter` (overdue ⇒ `i.wasOverdue`, sinon `i.priority === priorityFilter`).
3. Remplacer `filtered` par `displayed` dans `groupedByDay` uniquement (les `stats` restent basées sur `filtered`).
4. Convertir `StatCard` en bouton :
   - Ajouter props optionnelles `active?: boolean` et `onClick?: () => void`.
   - Wrapper interne en `<button type="button">` quand `onClick` fourni; ajouter `ring-2 ring-offset-1` à la couleur de la tonalité quand `active`.
   - Garder le rendu actuel (icône, label, valeur) inchangé visuellement à l'état non-actif.
5. Câbler dans le rendu des 4 cartes :
   - **Terminées** → `onClick = () => setPriorityFilter('all')`, `active = priorityFilter === 'all'`.
   - **Critiques** → `setPriorityFilter(prev => prev === 'critical' ? 'all' : 'critical')`.
   - **Importantes** → idem `'important'`.
   - **En retard** → idem `'overdue'`.
6. Ajouter, juste avant la liste groupée, un petit bouton "Effacer le filtre" visible uniquement si `priorityFilter !== 'all'`.
7. Adapter le message d'état vide quand `priorityFilter !== 'all'`.

## Hors scope

- Pas de changement à la logique de données / requêtes Supabase.
- Pas de modification du dialog de détail ni du résumé "Par employé".
- Pas de filtre multi-priorité (un seul à la fois, comportement toggle).
