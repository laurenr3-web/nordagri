---
name: Points Filtering System
description: Filtering on Points à surveiller page — status tabs + search + 3 dropdowns + sessionStorage persistence
type: feature
---
Page `/points` uses `usePointsFilter` hook (src/hooks/points/usePointsFilter.ts) for 100% client-side filtering.

State: `{ search, statusTab, type, priority, checkFilter }`. Persisted in sessionStorage key `nordagri_points_filters_v1` (volatile by design — resets on browser close).

UI in PointsPage.tsx:
- 4-col fixed-grid status Tabs (Tous/En cours/À surveiller/Réglés) — main navigation, NOT counted as active filter.
- PointsFilterBar: search input + 3 Selects (Type, Priorité, À vérifier) + reset button + clickable active-filter badges.
- "Tous" tab → GroupedView (sections per status, empty sections hidden, NO collapsibles).
- Other tabs → flat list.
- Empty state (zero points in DB) ≠ NoResultsState (filters yield zero) — strictly distinct branches.

UX rules baked into the hook:
- Tab counts reflect type+priority+search but NOT checkFilter (avoids unstable global numbers).
- resetFilters preserves statusTab (tab is navigation, not a filter).
- Search is normalized (lowercase + NFD diacritic stripping) over title + entity_label + last_event_note.
- checkFilter excludes points with null next_check_at when active.

Status enum is `'open' | 'watch' | 'resolved'` (NOT `'watching'`). Old collapsible-sections logic was removed.
