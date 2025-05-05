
-- Migration pour créer un trigger qui met à jour automatiquement les compteurs d'équipement
-- lorsqu'un nouveau plein de carburant est enregistré

-- Fonction qui sera exécutée par le trigger
CREATE OR REPLACE FUNCTION update_equipment_usage_from_fuel_log()
RETURNS TRIGGER AS $$
DECLARE
  current_hours NUMERIC;
  current_km NUMERIC;
  user_has_permission BOOLEAN;
BEGIN
  -- Vérifier que l'utilisateur a les permissions pour mettre à jour cet équipement
  -- Cette vérification est importante pour respecter les politiques RLS
  SELECT EXISTS (
    SELECT 1 FROM equipment e
    WHERE e.id = NEW.equipment_id 
    AND (
      -- L'utilisateur est propriétaire de l'équipement
      e.owner_id = auth.uid() 
      OR 
      -- Ou l'utilisateur appartient à la ferme associée à cet équipement
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.farm_id = e.farm_id
      )
    )
  ) INTO user_has_permission;
  
  IF NOT user_has_permission THEN
    -- Si l'utilisateur n'a pas les permissions nécessaires, on laisse le 
    -- plein s'ajouter mais on n'effectue pas la mise à jour de l'équipement
    RETURN NEW;
  END IF;

  -- Récupérer les valeurs actuelles de l'équipement
  SELECT valeur_actuelle, km INTO current_hours, current_km
  FROM equipment
  WHERE id = NEW.equipment_id;
  
  -- Mise à jour des heures si le plein contient hours_at_fillup
  -- et si cette valeur est supérieure à la valeur actuelle
  IF NEW.hours_at_fillup IS NOT NULL THEN
    UPDATE equipment
    SET valeur_actuelle = GREATEST(valeur_actuelle, NEW.hours_at_fillup),
        last_wear_update = NOW()
    WHERE id = NEW.equipment_id
    AND (valeur_actuelle IS NULL OR NEW.hours_at_fillup > valeur_actuelle);
  END IF;
  
  -- Mise à jour des km si le plein contient km_at_fillup (nouveau champ)
  -- et si cette valeur est supérieure à la valeur actuelle
  IF NEW.km_at_fillup IS NOT NULL THEN
    UPDATE equipment
    SET km = GREATEST(km, NEW.km_at_fillup),
        last_wear_update = NOW()
    WHERE id = NEW.equipment_id
    AND (km IS NULL OR NEW.km_at_fillup > km);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger qui appelle la fonction après insertion dans fuel_logs
DROP TRIGGER IF EXISTS update_equipment_after_fuel_log ON fuel_logs;
CREATE TRIGGER update_equipment_after_fuel_log
AFTER INSERT ON fuel_logs
FOR EACH ROW
EXECUTE FUNCTION update_equipment_usage_from_fuel_log();

-- Ajout d'une colonne km_at_fillup à la table fuel_logs si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fuel_logs' AND column_name = 'km_at_fillup'
  ) THEN
    ALTER TABLE fuel_logs ADD COLUMN km_at_fillup NUMERIC;
    COMMENT ON COLUMN fuel_logs.km_at_fillup IS 'Kilométrage de l''équipement lors du ravitaillement';
  END IF;
END $$;

-- Ajout d'une colonne km à la table equipment si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'equipment' AND column_name = 'km'
  ) THEN
    ALTER TABLE equipment ADD COLUMN km NUMERIC;
    COMMENT ON COLUMN equipment.km IS 'Kilométrage actuel de l''équipement';
  END IF;
END $$;
