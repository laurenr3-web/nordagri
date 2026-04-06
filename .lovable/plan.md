

# Plan — Flux complet d'invitation à une ferme

## Situation actuelle

- Le dialog d'invitation existe (InviteUserDialog + InviteUserForm + edge function `invite-user`)
- L'edge function crée une entrée dans la table `invitations` et ajoute directement l'utilisateur s'il existe déjà
- **Aucun email réel n'est envoyé** — l'invitation est juste stockée en base
- **Aucun flux d'acceptation** — un nouvel utilisateur qui s'inscrit ne voit pas ses invitations pendantes
- La page `NoFarmAccess` dit "contactez le support" au lieu de montrer les invitations en attente
- L'edge function a un bug : elle insère `created_by` dans `farm_members` mais cette colonne n'existe pas dans le schéma

## Changements prévus

### 1. Configurer l'envoi d'emails

Avant de pouvoir envoyer de vrais emails d'invitation, il faut configurer un domaine email. L'utilisateur devra passer par le dialog de configuration de domaine email dans Cloud.

### 2. Edge function `invite-user` — corrections

- Retirer le champ `created_by` de l'insert dans `farm_members` (n'existe pas dans le schéma)
- Ajouter l'envoi d'un email transactionnel après la création de l'invitation (via `send-transactional-email`)
- L'email contiendra un lien vers l'app avec l'ID d'invitation en paramètre

### 3. Template email d'invitation

Créer un template transactionnel `farm-invitation` qui contient :
- Nom de la ferme
- Rôle attribué
- Bouton "Rejoindre la ferme" pointant vers `/accept-invitation?id=XXX`

### 4. Page `/accept-invitation` — nouvelle page

Page qui gère le flux d'acceptation :
- Lit le paramètre `id` (invitation ID)
- Vérifie l'invitation (existe, non expirée, statut pending)
- Si l'utilisateur est connecté : accepte directement (ajoute dans `farm_members`, met à jour `profiles.farm_id`, passe l'invitation en `accepted`)
- Si non connecté : redirige vers `/auth` avec un paramètre `redirect=/accept-invitation?id=XXX`
- Affiche un message de succès et redirige vers le dashboard

### 5. Edge function `accept-invitation` — nouvelle

Gère l'acceptation côté serveur :
- Valide l'invitation (existe, pending, non expirée)
- Vérifie que l'email de l'utilisateur connecté correspond à l'email de l'invitation
- Ajoute l'utilisateur dans `farm_members` avec le rôle de l'invitation
- Met à jour `profiles.farm_id`
- Passe le statut de l'invitation à `accepted`
- Retourne un succès

### 6. Composant `NoFarmAccess` — amélioration

Au lieu de juste dire "contactez le support" :
- Vérifier s'il existe des invitations pendantes pour l'email de l'utilisateur connecté
- Si oui, afficher les invitations avec un bouton "Accepter" pour chacune
- Si non, garder le message actuel

### 7. Auth callback — gestion du redirect après signup

Modifier le flux post-signup/login pour rediriger vers la page d'acceptation si un paramètre `redirect` est présent (stocké dans localStorage avant la redirection vers `/auth`).

## Prérequis : domaine email

Pour envoyer de vrais emails, il faut d'abord configurer un domaine. Je vais d'abord demander la configuration du domaine, puis mettre en place les templates et le flux.

**Si vous ne souhaitez pas configurer d'email maintenant**, je peux implémenter tout le flux d'acceptation sans email : l'invitation serait créée en base, et l'utilisateur invité verrait l'invitation en se connectant (via la page NoFarmAccess ou la page accept-invitation partagée manuellement).

## Fichiers créés/modifiés

| Fichier | Action |
|---|---|
| `supabase/functions/invite-user/index.ts` | Corriger bugs, ajouter envoi email |
| `supabase/functions/accept-invitation/index.ts` | **Nouveau** — logique d'acceptation |
| `src/pages/AcceptInvitation.tsx` | **Nouveau** — page d'acceptation |
| `src/components/common/NoFarmAccess.tsx` | Afficher invitations pendantes |
| `src/components/ui/auth/hooks/useAuthHandlers.tsx` | Supporter redirect post-login |
| `src/App.tsx` | Ajouter route `/accept-invitation` |
| Template email (si domaine configuré) | Template d'invitation |

