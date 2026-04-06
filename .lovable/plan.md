

# Plan final — RBAC : réponses aux 3 points + migration

## Point 1 : `planning_tasks` DELETE pour member

Dans le plan précédent, la policy DELETE était :
```sql
has_farm_role(farm_id, 'admin') OR created_by = auth.uid()
```

C'est **cohérent** avec la règle globale : un member ne peut supprimer que ses propres tâches (`created_by = auth.uid()`), un admin peut tout supprimer. Le owner est couvert car `has_farm_role` traite le owner comme admin+. **Aucun ajustement nécessaire.**

## Point 2 : `fuel_logs` INSERT harmonisé

La policy INSERT actuelle est :
```sql
(created_by = auth.uid()) AND ((farm_id IS NULL) OR is_farm_member(farm_id))
```

Pour l'harmoniser avec le RBAC, elle devient :
```sql
(created_by = auth.uid()) AND ((farm_id IS NULL) OR has_farm_role(farm_id, 'member'))
```

Cela bloque les viewers sur INSERT, ce qui est cohérent avec la règle globale. **Ajusté.**

## Point 3 : Vérification de cohérence globale

Voici la matrice complète après ajustements :

```text
Table                          | SELECT           | INSERT              | UPDATE              | DELETE
-------------------------------|------------------|---------------------|---------------------|---------------------
equipment                      | owner/member(*)  | owner/member+       | owner/member+       | owner/admin+
parts_inventory                | owner/member(*)  | owner/member+       | owner/member+       | owner/admin+
fuel_logs                      | member(*)/creator| creator+member+     | creator+member+     | creator+admin+
interventions                  | owner/member(*)  | owner/member+(equip)| owner/member+(equip)| owner/admin+(equip)
maintenance_tasks              | owner/member(*)  | owner/member+(equip)| owner/member+(equip)| owner/admin+(equip)
maintenance_plans              | owner/member(*)  | owner/member+       | owner/member+       | owner/admin+
equipment_logs/photos/sched/qr | owns_equipment   | can_write(member)   | can_write(member)   | can_write(admin)
planning_tasks                 | member(*)        | member++created_by  | member+             | admin+OR created_by
planning_category_importance   | member(*)        | admin+              | admin+              | admin+

(*) = inchangé   (+) = via has_farm_role, owner toujours inclus
```

**Tout est cohérent** : viewer = lecture seule, member = insert/update, admin = delete, owner = tout.

## Migration SQL finale

Une seule migration contenant :

1. **Fonction `has_farm_role`** — owner via `farms.owner_id`, hiérarchie admin(3) > member(2) > viewer(1)
2. **Fonction `can_write_equipment`** — pour les 4 tables liées à equipment_id
3. **~30 DROP + CREATE POLICY** exactement comme détaillé dans le plan précédent, avec la correction fuel_logs INSERT

## Fichiers frontend

| Fichier | Changement |
|---|---|
| `src/hooks/useFarmRole.ts` (nouveau) | Hook retournant `role`, `canEdit`, `canDelete` |
| `src/components/equipment/detail/EquipmentHeader.tsx` | Masquer Edit/Delete selon rôle |
| `src/components/equipment/detail/EquipmentDetailContent.tsx` | Masquer édition compteur pour viewers |

