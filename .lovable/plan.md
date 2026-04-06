

# Plan — Corriger le flux d'acceptation d'invitation

## Problemes identifies

L'analyse du code revele plusieurs bugs qui empechent le flux d'invitation de fonctionner correctement :

1. **Erreur FK dans accept-invitation** : Les logs montrent `Key (user_id)=(...) is not present in table "users"`. La table `farm_members` a une FK vers `auth.users`, mais l'Edge Function `accept-invitation` utilise `getClaims()` pour extraire le `user_id` — si le profil/utilisateur est nouveau, cette reference peut echouer.

2. **Le profil n'est pas mis a jour apres acceptation** : Meme quand `farm_members` est correctement insere, plusieurs services (`FarmSettingsSection`, `useSettings`, `getParts`, `Dashboard`) verifient `profiles.farm_id` pour determiner la ferme active. Si `farm_id` n'est pas mis a jour dans le profil, l'utilisateur voit "Creer ma ferme" au lieu des donnees.

3. **`useFarmId` fonctionne bien** mais le Dashboard utilise `profileData?.farm_id` (ligne 65 de Dashboard.tsx) pour afficher le banner "Creer ma ferme", ce qui est redondant et incorrect pour les membres invites.

4. **`NoFarmAccess` utilise `supabase.functions.invoke`** au lieu de `fetch`, ce qui ne parse pas correctement les erreurs.

5. **Page AcceptInvitation** : Le flux de redirection fonctionne (localStorage + returnTo), mais l'Edge Function echoue a inserer dans `farm_members`.

## Changements prevus

### 1. Corriger l'Edge Function `accept-invitation` (bug critique)
- Remplacer `getClaims()` par `getUser()` via le service-role client pour valider le token
- Ajouter un fallback : si l'insert dans `farm_members` echoue avec une erreur FK, verifier que le `user_id` existe dans `auth.users` et retenter
- S'assurer que `profiles.farm_id` est bien mis a jour apres l'insertion reussie

### 2. Corriger le Dashboard pour les membres invites
- Dans `Dashboard.tsx`, remplacer la verification `!!profileData?.farm_id` par l'utilisation de `useFarmId()` pour determiner si l'utilisateur a acces a une ferme (via `farm_members` OU `farms.owner_id`)
- Supprimer le banner "Creer ma ferme" quand `useFarmId` retourne un `farmId` valide

### 3. Corriger `NoFarmAccess` — utiliser `fetch` au lieu de `supabase.functions.invoke`
- Aligner avec le pattern utilise dans `AcceptInvitation.tsx` pour un parsing correct des erreurs

### 4. Mettre a jour `AcceptInvitation.tsx` — redirection vers la ferme invitee
- Apres acceptation reussie, forcer un rechargement complet (`window.location.href = '/dashboard'`) pour que le profil soit recharge avec le nouveau `farm_id`

### 5. Corriger `FarmSettingsSection` et `useSettings` pour les membres invites
- Utiliser `useFarmId()` comme source de verite au lieu de `profiles.farm_id` pour determiner la ferme active

## Fichiers modifies

| Fichier | Changement |
|---|---|
| `supabase/functions/accept-invitation/index.ts` | Corriger auth + gestion erreur FK |
| `src/pages/Dashboard.tsx` | Utiliser `useFarmId` au lieu de `profileData.farm_id` |
| `src/pages/AcceptInvitation.tsx` | Forcer reload apres acceptation |
| `src/components/common/NoFarmAccess.tsx` | Utiliser `fetch` au lieu de `invoke` |
| `src/components/settings/farm/FarmSettingsSection.tsx` | Utiliser `useFarmId` |

