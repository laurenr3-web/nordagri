
-- Création de la table farm_settings pour stocker les préférences par ferme
CREATE TABLE IF NOT EXISTS public.farm_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  modules JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(farm_id)
);

-- Ajout des politiques RLS pour limiter l'accès aux utilisateurs autorisés
ALTER TABLE public.farm_settings ENABLE ROW LEVEL SECURITY;

-- Politique pour sélectionner les paramètres de ferme
CREATE POLICY farm_settings_select_policy 
  ON public.farm_settings 
  FOR SELECT 
  USING (farm_id IN (SELECT farm_id FROM public.profiles WHERE id = auth.uid()));

-- Politique pour insérer des paramètres de ferme
CREATE POLICY farm_settings_insert_policy 
  ON public.farm_settings 
  FOR INSERT 
  WITH CHECK (farm_id IN (SELECT farm_id FROM public.profiles WHERE id = auth.uid()));

-- Politique pour mettre à jour les paramètres de ferme
CREATE POLICY farm_settings_update_policy 
  ON public.farm_settings 
  FOR UPDATE 
  USING (farm_id IN (SELECT farm_id FROM public.profiles WHERE id = auth.uid()));

-- Trigger pour mettre à jour le timestamp updated_at
CREATE TRIGGER update_farm_settings_timestamp
  BEFORE UPDATE ON public.farm_settings
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_timestamp();
