| schemaname | tablename           | policyname                                     | permissive | cmd    | qual                                                                                                                                                                                                                                                                                                                      |
| ---------- | ------------------- | ---------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public     | equipment           | Enable all access for authenticated users      | PERMISSIVE | ALL    | true                                                                                                                                                                                                                                                                                                                      |
| public     | equipment_documents | Access to equipment documents                  | PERMISSIVE | ALL    | ((equipment_id IN ( SELECT equipments.id
   FROM equipments
  WHERE (equipments.owner_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))))                                                                                    |
| public     | equipments          | Users can delete their own equipment           | PERMISSIVE | DELETE | (owner_id = auth.uid())                                                                                                                                                                                                                                                                                                   |
| public     | equipments          | Users can insert their own equipment           | PERMISSIVE | INSERT | null                                                                                                                                                                                                                                                                                                                      |
| public     | equipments          | Users can update their own equipment           | PERMISSIVE | UPDATE | (owner_id = auth.uid())                                                                                                                                                                                                                                                                                                   |
| public     | equipments          | Users can view their own equipment             | PERMISSIVE | SELECT | ((owner_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))))                                                                                                                                                                    |
| public     | farms               | Users can insert their farms                   | PERMISSIVE | INSERT | null                                                                                                                                                                                                                                                                                                                      |
| public     | farms               | Users can update their farms                   | PERMISSIVE | UPDATE | (auth.uid() = owner_id)                                                                                                                                                                                                                                                                                                   |
| public     | farms               | Users can view farms they own                  | PERMISSIVE | SELECT | (auth.uid() = owner_id)                                                                                                                                                                                                                                                                                                   |
| public     | maintenance_records | Users can delete maintenance records           | PERMISSIVE | DELETE | ((equipment_id IN ( SELECT equipments.id
   FROM equipments
  WHERE (equipments.owner_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))))                                                                                    |
| public     | maintenance_records | Users can insert maintenance records           | PERMISSIVE | INSERT | null                                                                                                                                                                                                                                                                                                                      |
| public     | maintenance_records | Users can update maintenance records           | PERMISSIVE | UPDATE | ((equipment_id IN ( SELECT equipments.id
   FROM equipments
  WHERE (equipments.owner_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'technician'::text]))))))                                                   |
| public     | maintenance_records | Users can view maintenance for their equipment | PERMISSIVE | SELECT | ((equipment_id IN ( SELECT equipments.id
   FROM equipments
  WHERE (equipments.owner_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'manager'::text]))))))                                                      |
| public     | maintenance_tasks   | Access to maintenance tasks                    | PERMISSIVE | ALL    | ((EXISTS ( SELECT 1
   FROM equipments
  WHERE (((equipments.id)::text = (maintenance_tasks.equipment_id)::text) AND (equipments.owner_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'technician'::text])))))) |
| public     | parts_inventory     | Users can delete their own parts               | PERMISSIVE | DELETE | (owner_id = auth.uid())                                                                                                                                                                                                                                                                                                   |
| public     | parts_inventory     | Users can insert their own parts               | PERMISSIVE | INSERT | null                                                                                                                                                                                                                                                                                                                      |
| public     | parts_inventory     | Users can update their own parts               | PERMISSIVE | UPDATE | (owner_id = auth.uid())                                                                                                                                                                                                                                                                                                   |
| public     | parts_inventory     | Users can view parts they own                  | PERMISSIVE | SELECT | ((owner_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'manager'::text]))))))                                                                                                                                      |
| public     | profiles            | Users can update their own profile             | PERMISSIVE | UPDATE | (auth.uid() = id)                                                                                                                                                                                                                                                                                                         |
| public     | profiles            | Users can view their own profile               | PERMISSIVE | SELECT | (auth.uid() = id)                                                                                                                                                                                                                                                                                                         |
| public     | team_members        | Farm owners can delete team members            | PERMISSIVE | DELETE | (EXISTS ( SELECT 1
   FROM farms
  WHERE ((farms.id = team_members.farm_id) AND (farms.owner_id = auth.uid()))))                                                                                                                                                                                                          |
| public     | team_members        | Farm owners can insert team members            | PERMISSIVE | INSERT | null                                                                                                                                                                                                                                                                                                                      |
| public     | team_members        | Farm owners can update team members            | PERMISSIVE | UPDATE | (EXISTS ( SELECT 1
   FROM farms
  WHERE ((farms.id = team_members.farm_id) AND (farms.owner_id = auth.uid()))))                                                                                                                                                                                                          |
| public     | team_members        | Farm owners can view team members              | PERMISSIVE | SELECT | (EXISTS ( SELECT 1
   FROM farms
  WHERE ((farms.id = team_members.farm_id) AND (farms.owner_id = auth.uid()))))                                                                                                                                                                                                          |
