
Objectif: quand quelqu’un ouvre un lien d’invitation sans compte ou sans session valide, il doit être envoyé vers l’authentification, puis revenir automatiquement sur l’invitation après inscription/connexion, et enfin ouvrir la ferme invitée.

Constat
1. `AcceptInvitation.tsx` s’appuie sur `isAuthenticated` sans attendre la fin du chargement auth. Une session locale invalide peut donc être traitée comme “connectée”.
2. Le retour post-auth est perdu pendant l’inscription/vérification email :
   - le lien d’invitation ne stocke que `pendingInvitation`
   - `handleSignup` redirige vers `/auth/callback` sans conserver `returnTo`
   - `AuthCallback` renvoie toujours vers `/dashboard`
3. Le backend `accept-invitation` renvoie un 401 générique. Les logs montrent `user_not_found`, donc l’UI affiche “Non autorisé” au lieu de relancer proprement le flux.

Plan
1. Centraliser la cible post-auth
   - Ajouter un helper dédié pour stocker/lire/vider la cible complète après auth (ex. `/accept-invitation?id=...`), pas seulement l’id.
   - Réutiliser ce helper dans `AcceptInvitation`, `Auth`, `AuthCallback` et l’inscription.

2. Corriger `src/pages/AcceptInvitation.tsx`
   - Attendre `loading === false` avant de décider quoi faire.
   - Si l’utilisateur n’a pas de session valide : mémoriser la cible d’invitation, puis rediriger vers `/auth` avec `returnTo` encodé et preview token conservé.
   - Avant l’appel à la fonction backend, vérifier que la session utilisateur est réellement valide.
   - Si l’API répond 401 / `Non autorisé` : déconnecter la session locale invalide, conserver la cible d’invitation, puis renvoyer vers `/auth` au lieu d’afficher une erreur finale.

3. Corriger le flux login / signup / callback
   - `src/pages/Auth.tsx` : utiliser d’abord `returnTo` ou la cible mémorisée, puis rediriger dessus après connexion.
   - `src/components/ui/auth/hooks/useAuthHandlers.tsx` : inclure `returnTo` dans `emailRedirectTo` pour l’inscription, et ne plus appeler `onSuccess` tant qu’une vérification email est requise.
   - `src/pages/Auth/Callback.tsx` : après `setSession`, renvoyer vers l’invitation mémorisée au lieu de toujours aller sur `/dashboard`.
   - Ajouter un petit message contextuel sur la page Auth quand l’utilisateur vient d’un lien d’invitation.

4. Durcir `supabase/functions/accept-invitation/index.ts`
   - Revenir au pattern cohérent du projet : valider le JWT avec `getClaims()`, puis vérifier explicitement l’existence de l’utilisateur côté admin.
   - Transformer le cas `user_not_found` en message métier clair (session expirée / compte à créer ou reconnecter), pas en 401 opaque.
   - Conserver la logique déjà utile : vérification email ↔ invitation, création/upsert du profil, ajout dans `farm_members`, mise à jour de `profiles.farm_id` pour basculer vers la ferme invitée.

5. Aligner `src/components/common/NoFarmAccess.tsx`
   - Réutiliser la même gestion des sessions invalides et des retours vers `/auth` pour éviter le même blocage depuis la liste des invitations en attente.

Détails techniques
- Fichiers à modifier :
  - `src/pages/AcceptInvitation.tsx`
  - `src/pages/Auth.tsx`
  - `src/pages/Auth/Callback.tsx`
  - `src/components/ui/auth/hooks/useAuthHandlers.tsx`
  - `src/components/common/NoFarmAccess.tsx`
  - `supabase/functions/accept-invitation/index.ts`
  - probablement un nouveau helper du type `src/utils/authRedirect.ts`
- Pas de migration base de données nécessaire.
- Toutes les redirections de ce flux devront conserver `withPreviewToken(...)`.

Validation prévue
1. Clic sur un lien d’invitation sans compte → page Auth, sans erreur “Non autorisé”.
2. Création de compte + validation email → retour automatique sur l’invitation → acceptation → ouverture de la ferme invitée.
3. Connexion avec un compte existant invité → acceptation directe → ferme invitée active.
4. Session locale cassée / stale → déconnexion forcée + retour vers Auth, sans écran d’erreur final.
