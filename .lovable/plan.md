# Onboarding interactif Nordagri (react-joyride) — Livraison en 3 messages

## Vue d'ensemble

Tutoriel guidé multi-tours (welcome / equipment / maintenance), démarrage automatique à la 1ʳᵉ connexion, persistance Supabase + fallback localStorage, relance manuelle depuis Réglages, 14 garde-fous anti-bug.

Livré en **3 messages successifs** avec validation entre chaque.

---

## MESSAGE 1 — Fondations (state + DB)

### 1.1 Migration SQL
Création de `public.user_preferences` (PK uuid, `user_id` UNIQUE, `completed_tours` jsonb, `onboarding_skipped` bool, timestamps).
- RLS activée + 3 policies (SELECT/INSERT/UPDATE) sur `auth.uid() = user_id`.
- Pas de FK vers `auth.users`.
- Trigger BEFORE UPDATE qui réutilise la fonction existante `public.set_updated_at()`.

### 1.2 `src/hooks/onboarding/useUserPreferences.ts`
- Expose `{ prefs, loading, save(partial), reload() }`.
- Upsert sur `user_id`.
- Parser strict pour `completed_tours` (jsonb → `TourName[]`) — toute valeur invalide ignorée silencieusement.
- Fallback `localStorage` clé `nordagri_onboarding_v1_${userId}` si Supabase échoue (try/catch + `logger.error` via `src/utils/logger.ts`).
- Jamais bloquant : retourne des prefs vides par défaut.

### 1.3 `src/contexts/OnboardingContext.tsx`
```ts
type TourName = 'welcome' | 'equipment' | 'maintenance';
interface OnboardingContextValue {
  prefsLoaded: boolean;
  isOnboardingActive: boolean;
  currentTour: TourName | null;
  completedTours: TourName[];
  startTour(name: TourName): void;       // refuse si currentTour !== null OU !prefsLoaded
  forceStartTour(name: TourName): void;  // recharge prefs puis lance, marche même !prefsLoaded
  stopTour(): void;
  markTourCompleted(name: TourName): Promise<void>;
  resetTours(): Promise<void>;
}
```

### 1.4 `src/components/onboarding/OnboardingProvider.tsx`
- Monté dans `<AuthProvider>` (besoin de `user.id`).
- Charge les prefs dès `user?.id` connu → `setPrefsLoaded(true)`.
- Auto-start gated par `prefsLoaded === true`.
- Cleanup `useEffect` → `stopTour()` au démontage.
- Rend `<TourGuide />` (stub vide en Message 1, implémenté en Message 2).

### 1.5 `src/App.tsx`
Insertion de `<OnboardingProvider>` entre `<AuthProvider>` et `<OfflineProvider>`. Imports statiques (memory rule).

### Critères d'acceptation Message 1
- Table `user_preferences` créée avec RLS + trigger `updated_at`.
- Contexte se charge sans erreur, `prefsLoaded` passe à `true`.
- Aucune régression. TypeScript clean. Console propre.

**STOP — Validation utilisateur attendue.**

---

## MESSAGE 2 — Tour de bienvenue

### 2.1 `src/components/onboarding/tours/types.ts`
Export `TourName`, `TourTexts`.

### 2.2 `src/components/onboarding/tours/welcomeTour.ts`
Exporte :
- `welcomeTourTexts` (FR, i18n-ready).
- `welcomeTourSteps` (5 étapes desktop) : `body` center → `[data-tour="main-nav"]` → `[data-tour="add-equipment"]` → `[data-tour="notifications"]` → `[data-tour="settings-menu-trigger"]`.
- `welcomeTourStepsMobile` (3 étapes **choisies** : Bienvenue + Navigation + Add Equipment). Pas de `slice`.

### 2.3 `src/components/onboarding/TourGuide.tsx`
Composant unique consommant le contexte, rend `<Joyride>` :
- Props : `continuous`, `showProgress`, `showSkipButton`, `disableOverlayClose`, `scrollToFirstStep`, `spotlightClicks={false}`, `disableScrolling={false}`.
- `locale` FR (Précédent / Suivant / Terminer / Passer / Fermer / Ouvrir).
- `styles.options`: `primaryColor: '#2E8B57'`, `zIndex: 10000`.
- Filtrage des étapes : on garde celles dont `target === 'body'` ou `document.querySelector(target)` existe.
- Choix desktop/mobile via `useMediaQuery('(max-width: 767px)')` (pas de troncature).
- Touch: `window.matchMedia('(hover: none)').matches` → `buttonNext.minHeight = 44`.
- **Anti focus-trap Radix** : avant un démarrage AUTO, si `[role="dialog"][data-state="open"]` existe → on stocke `pendingTour`. Un `useEffect` monte un `MutationObserver` sur `document.body` (attributes + subtree) qui lance `pendingTour` dès que plus aucun dialog ouvert. Cleanup `observer.disconnect()` au démontage. `pendingTour` annulé si `useLocation().pathname` change.
- Callback Joyride : `STATUS.FINISHED` ou `STATUS.SKIPPED` → `markTourCompleted(currentTour)` + `stopTour()`. **Skip = completed**.

### 2.4 Data-attributes (Message 2)
Ajout uniquement (logique métier intacte) :
| Attribut | Fichier |
|---|---|
| `data-tour="main-nav"` | `src/components/layout/Navbar.tsx` (élément `<nav>`) |
| `data-tour="add-equipment"` | bouton CTA dans `src/components/equipment/page/EquipmentContentSection.tsx` |
| `data-tour="notifications"` | wrapper `<NotificationCenter />` dans `src/components/layout/UserMenu.tsx` |
| `data-tour="settings-menu-trigger"` | bouton trigger avatar du UserMenu, jamais sur le contenu du dropdown |

### Critères d'acceptation Message 2
- 1er login : welcome démarre auto sur `/dashboard`.
- Skip → pas de relance prochain login.
- Mobile 375px : 3 étapes choisies, pas de débordement, boutons ≥ 44px.
- Modal shadcn ouverte au démarrage : tour différé, lancé proprement après fermeture, sans `setTimeout`.
- Cible absente : étape sautée silencieusement.
- `MutationObserver` `disconnect()` au démontage.

**STOP — Validation utilisateur attendue.**

---

## MESSAGE 3 — Tours equipment / maintenance + Réglages

### 3.1 `src/components/onboarding/tours/equipmentTour.ts`
4 étapes desktop (`equipment-qr`, `equipment-counters`, `maintenance-schedule`, historique des interventions) + version mobile choisie.

### 3.2 Déclenchement dans `src/pages/EquipmentDetail.tsx`
`useEffect` avec 6 conditions cumulatives :
```ts
if (!prefsLoaded) return;
if (!completedTours.includes('welcome')) return;
if (completedTours.includes('equipment')) return;
if (equipments.length < 1) return;
if (currentTour !== null) return;
if (isLoading) return;
startTour('equipment');
```

### 3.3 `src/components/onboarding/tours/maintenanceTour.ts`
3 étapes (pas de version mobile distincte).

### 3.4 Déclenchement dans `src/pages/Maintenance.tsx`
Même schéma, prérequis `welcome` complété, après `isLoading === false`.

### 3.5 Data-attributes (Message 3)
| Attribut | Fichier |
|---|---|
| `data-tour="equipment-qr"` | bouton QR dans `src/components/equipment/qr/...` |
| `data-tour="equipment-counters"` | section compteurs `src/components/equipment/wear/...` |
| `data-tour="maintenance-schedule"` | bouton "Planifier maintenance" page Maintenance |

### 3.6 `src/components/settings/profile/OnboardingSection.tsx`
Intégré dans l'onglet **Profil** de `src/pages/Settings.tsx` :
- Bouton **"Relancer le tour de bienvenue"** → `forceStartTour('welcome')`.
- Bouton **"Réinitialiser tous les tours"** → `resetTours()` (vide `completed_tours`, `onboarding_skipped=false`, toast FR).

### Checklist finale (15 points)
1. 1er login : welcome auto sur `/dashboard`.
2. Skip → pas de relance.
3. Modal ouverte au démarrage : tour différé proprement, sans `setTimeout`.
4. Réglages → relancer welcome OK.
5. Réglages → reset tours OK + toast.
6. Mobile 375px : 3 étapes choisies, pas de débordement, touch ≥ 44px.
7. Cible absente : étape sautée, pas de crash.
8. Refresh pendant un tour : pas de relance en boucle.
9. `equipmentTour` : welcome fini ET ≥ 1 équipement ET sur EquipmentDetail.
10. `maintenanceTour` : `/maintenance` + `isLoading === false`.
11. Aucun `setTimeout` / `setInterval`.
12. Aucun `any` / `as unknown as`.
13. Console propre.
14. `MutationObserver.disconnect()` au démontage + `pendingTour` annulé sur changement de route.
15. `completed_tours` parsé strictement, auto-start jamais si `!prefsLoaded`.

---

## Récap des 14 garde-fous

1. Pas de `setTimeout`/`setInterval` — `useEffect` + `MutationObserver`.
2. Étapes invalides filtrées au démarrage.
3. Mobile : étapes **choisies**, pas de `slice`.
4. Persistance Supabase + fallback localStorage versionné, jamais bloquant.
5. `startTour` refuse si tour actif OU `!prefsLoaded`.
6. `forceStartTour` recharge prefs avant lancement.
7. Tours de page attendent `isLoading === false`.
8. Cleanup `stopTour` au démontage du provider.
9. TypeScript strict, aucun `any`.
10. Skip = `markTourCompleted` (anti-relance).
11. Textes externalisés dans `tourTexts`.
12. Auto-start gated par `prefsLoaded === true`.
13. Auto-start différé via `MutationObserver` si Radix dialog ouvert, avec cleanup et annulation sur changement de route.
14. Parser strict pour `completed_tours`.

## Choix techniques confirmés
- Trigger `updated_at` : réutilise `public.set_updated_at()` (existante).
- Logger : `src/utils/logger.ts` (existant).
- `<OnboardingProvider>` placé entre `<AuthProvider>` et `<OfflineProvider>` dans `App.tsx`, imports statiques.

---

**Action immédiate après approbation : MESSAGE 1 uniquement.**
