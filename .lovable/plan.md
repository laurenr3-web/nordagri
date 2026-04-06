

# Plan — Afficher tous les membres liés à la ferme dans "Gestion des accès"

## Problème

La section affiche "Aucun membre d'équipe" car le service `teamService.ts` a deux bugs :
1. `fetchFarmMembers` requête `profiles.email` qui n'existe pas — la requête échoue silencieusement
2. `fetchTeamMembers` cherche les profils par `profiles.farm_id`, mais cette colonne ne reflète pas toujours la ferme active (surtout pour les membres invités)

La source de vérité pour les membres d'une ferme est : **`farms.owner_id`** (propriétaire) + **`farm_members`** (membres invités).

## Solution

Réécrire `teamService.ts` avec une logique simple et fiable :

1. **Récupérer le propriétaire** : requête `farms` par `id = farmId` pour obtenir `owner_id`, puis profil associé → rôle `owner`
2. **Récupérer les membres** : requête `farm_members` par `farm_id`, puis profils associés (sans `email`) → rôle depuis `farm_members.role`
3. **Combiner et dédupliquer** par `user_id`

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/services/teamService.ts` | Réécrire `fetchTeamData` pour utiliser `farms.owner_id` + `farm_members` comme source de vérité. Supprimer `profiles.email` des requêtes. |

## Détails techniques

```text
fetchTeamData(farmId)
  ├── SELECT owner_id FROM farms WHERE id = farmId
  │   └── SELECT first_name, last_name FROM profiles WHERE id = owner_id
  │       → TeamMember { role: 'owner' }
  ├── SELECT id, user_id, role, created_at FROM farm_members WHERE farm_id = farmId
  │   └── Pour chaque: SELECT first_name, last_name FROM profiles WHERE id = user_id
  │       → TeamMember { role: farm_members.role }
  └── Dédupliquer par user_id (owner prioritaire)
```

Aucune migration SQL nécessaire.

