# Tutoriel interactif d'accueil

Un tour guidé court qui apparaît au premier connexion et amène l'utilisateur à réaliser 3 actions concrètes : ajouter un point, créer une tâche, voir le dashboard. Skippable à tout moment, relançable depuis Paramètres → Profil.

## 1. Comportement utilisateur

- À la première connexion (après création du compte et de la ferme), un overlay léger apparaît avec un tooltip pointant vers la première action.
- Une **checklist flottante** (en bas à droite, repliable) montre la progression : `Ajouter un point` · `Créer une tâche` · `Voir le dashboard`.
- Un bouton **« Passer »** est toujours visible dans le tooltip et dans la checklist.
- L'étape avance automatiquement quand l'utilisateur réalise l'action attendue (clic sur le bouton mis en évidence, dialog ouvert, etc.). L'utilisateur peut aussi cliquer **« Suivant »** pour avancer manuellement.
- À la fin : petit toast/carte « C'est bon 👍 Tu peux utiliser NordAgri ».
- Relançable depuis **Paramètres → Profil → "Revoir le tutoriel"**.

## 2. Étapes

1. **Étape 1 – Ajouter un point** (sur `/points`)
   - Surbrillance du bouton « + Nouveau point » dans `PointsPage`.
   - Tooltip : *"Ajoute un point à surveiller (ex : problème sur un animal ou un équipement)"*.
   - Avance quand `NewPointDialog` s'ouvre OU sur clic « Suivant ».

2. **Étape 2 – Créer une tâche** (sur la fiche du point ou sur `/planning`)
   - Surbrillance du bouton « Créer une tâche » dans `PointDetailDialog` (`CreateLinkedTaskDialog`). Si l'utilisateur a sauté l'étape 1, on retombe sur le bouton « + Nouvelle tâche » dans `Planning`.
   - Tooltip : *"Crée une tâche pour régler ce point"*.

3. **Étape 3 – Voir le dashboard** (sur `/dashboard`)
   - Surbrillance de la zone du tableau de bord (élément `PageHeader` + premier widget).
   - Tooltip : *"Ici tu vois ce qui demande ton attention aujourd'hui"*.
   - Bouton « Terminer ».

## 3. Architecture technique

### a. Persistance du flag

Migration ajoutant la colonne `has_seen_onboarding boolean default false` à `public.profiles`. Pas de nouvelle policy : les policies existantes (lecture par soi/membres, update par soi) couvrent le cas. Lecture/écriture via le client Supabase. Fallback `localStorage` (`nordagri.onboarding.seen`) pour éviter le flash avant le retour réseau.

### b. Nouveaux fichiers

```
src/components/onboarding/
  OnboardingProvider.tsx      // contexte: étape courante, start/skip/next/complete
  OnboardingOverlay.tsx       // backdrop assombri + spotlight sur l'élément ciblé
  OnboardingTooltip.tsx       // bulle (titre, texte, "Passer" / "Suivant")
  OnboardingChecklist.tsx     // carte flottante repliable, 3 items
  steps.ts                    // définition des 3 étapes (route, sélecteur, texte)
src/hooks/onboarding/
  useOnboarding.ts            // hook public (start, skip, isActive, currentStep)
  useOnboardingFlag.ts        // lit/écrit profiles.has_seen_onboarding
```

### c. Ciblage des éléments

Attribut `data-onboarding="add-point" | "create-task" | "dashboard"` posé sur :
- bouton « + Nouveau point » dans `src/components/points/PointsPage.tsx`
- bouton « Créer une tâche » dans `src/components/points/PointDetailDialog.tsx` (et fallback sur le bouton « + » de `Planning.tsx`)
- conteneur du dashboard dans `src/pages/Dashboard.tsx`

L'overlay calcule la `getBoundingClientRect()` de la cible, dessine un trou (mask SVG) et positionne le tooltip à côté. `MutationObserver` + `requestAnimationFrame` pour suivre les changements de layout. Si la cible n'est pas trouvée après 2s, le tutoriel propose une CTA « Aller à la page » qui navigue vers la route attendue.

### d. Déclenchement

Dans `OnboardingProvider` (monté dans `App.tsx` sous `AuthProvider`) :
- Au mount, si `user` existe ET `profile.has_seen_onboarding === false` ET `farmId` existe → `start()`.
- Si pas de ferme, on n'amorce pas (l'utilisateur voit déjà la bannière « Créer ma ferme »).
- `skip()` et `complete()` appellent `update profiles set has_seen_onboarding = true`.

### e. Intégration Settings

Dans `src/components/settings/profile/ProfileSection.tsx`, ajouter une ligne :
- Label : « Tutoriel d'accueil »
- Bouton secondaire « Revoir le tutoriel » → `useOnboarding().start({ force: true })` qui remet aussi le flag à `false` côté DB.

## 4. UX details

- Backdrop : `bg-black/50` + `backdrop-blur-[2px]`, transition `framer-motion`.
- Spotlight : rectangle arrondi `rounded-xl` autour de la cible avec padding 8px et `box-shadow: 0 0 0 9999px rgba(0,0,0,.5)`.
- Tooltip : carte `bg-popover` avec titre, texte, et footer `[Passer]  [Suivant]`. Sur mobile (≤640px) la tooltip se positionne en bas plein-largeur.
- Checklist : carte 280px en `fixed bottom-4 right-4` (au-dessus de la bottom-nav mobile), repliable en pastille.
- Aucune bibliothèque externe : pas de `react-joyride` / `shepherd` (composants maison, cohérents avec shadcn).

## 5. Migration

```sql
alter table public.profiles
  add column if not exists has_seen_onboarding boolean not null default false;
```

(Les utilisateurs existants gardent `false` par défaut → ils verront le tutoriel à leur prochaine visite ; acceptable et conforme à l'objectif "tutoriel relançable".)

## 6. Étapes de livraison

1. Migration SQL `has_seen_onboarding`.
2. `OnboardingProvider`, hooks, overlay, tooltip, checklist, `steps.ts`.
3. Ajout des `data-onboarding="…"` sur les 3 cibles.
4. Montage du provider dans `App.tsx`, déclenchement automatique.
5. Section « Revoir le tutoriel » dans `ProfileSection`.
6. QA manuel : nouveau compte, skip, force-restart, mobile 390px.

## 7. Hors périmètre

- Pas de tutoriels par module (équipement, parts, etc.) — uniquement les 3 étapes demandées.
- Pas d'A/B testing ni de tracking analytics dans cette première version.
