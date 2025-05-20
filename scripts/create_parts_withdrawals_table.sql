
-- Script SQL pour créer la table parts_withdrawals dans Supabase
-- Exécutez ce script dans la console SQL de Supabase (https://app.supabase.io)

-- Création de la table parts_withdrawals
CREATE TABLE IF NOT EXISTS public.parts_withdrawals (
    id BIGSERIAL PRIMARY KEY,
    part_id BIGINT NOT NULL REFERENCES public.parts_inventory(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason VARCHAR(50) NOT NULL,
    custom_reason VARCHAR(255),
    intervention_id BIGINT REFERENCES public.interventions(id),
    comment TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    farm_id UUID REFERENCES farms(id)
);

-- Ajout des commentaires
COMMENT ON TABLE public.parts_withdrawals IS 'Historique des retraits de pièces';
COMMENT ON COLUMN public.parts_withdrawals.id IS 'Identifiant unique';
COMMENT ON COLUMN public.parts_withdrawals.part_id IS 'ID de la pièce retirée';
COMMENT ON COLUMN public.parts_withdrawals.quantity IS 'Quantité retirée';
COMMENT ON COLUMN public.parts_withdrawals.reason IS 'Raison du retrait';
COMMENT ON COLUMN public.parts_withdrawals.custom_reason IS 'Raison personnalisée si "other"';
COMMENT ON COLUMN public.parts_withdrawals.intervention_id IS 'ID de l''intervention associée';
COMMENT ON COLUMN public.parts_withdrawals.comment IS 'Commentaire additionnel';
COMMENT ON COLUMN public.parts_withdrawals.user_id IS 'ID de l''utilisateur qui a effectué le retrait';
COMMENT ON COLUMN public.parts_withdrawals.created_at IS 'Date et heure du retrait';
COMMENT ON COLUMN public.parts_withdrawals.farm_id IS 'ID de l''exploitation agricole';

-- Création des index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_parts_withdrawals_part_id ON public.parts_withdrawals (part_id);
CREATE INDEX IF NOT EXISTS idx_parts_withdrawals_intervention_id ON public.parts_withdrawals (intervention_id);
CREATE INDEX IF NOT EXISTS idx_parts_withdrawals_user_id ON public.parts_withdrawals (user_id);
CREATE INDEX IF NOT EXISTS idx_parts_withdrawals_farm_id ON public.parts_withdrawals (farm_id);

-- Activation de la sécurité au niveau des lignes (RLS)
ALTER TABLE public.parts_withdrawals ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture uniquement des retraits associés à la ferme de l'utilisateur
CREATE POLICY "Users can view their farm withdrawals"
    ON public.parts_withdrawals
    FOR SELECT
    USING (
        farm_id IN (
            SELECT farm_id FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Politique pour permettre l'insertion de nouveaux retraits
CREATE POLICY "Users can insert withdrawals for their farm"
    ON public.parts_withdrawals
    FOR INSERT
    WITH CHECK (
        farm_id IN (
            SELECT farm_id FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Politique pour permettre la mise à jour uniquement des retraits créés par l'utilisateur
CREATE POLICY "Users can update their own withdrawals"
    ON public.parts_withdrawals
    FOR UPDATE
    USING (user_id = auth.uid());

-- Politique pour permettre la suppression uniquement des retraits créés par l'utilisateur
CREATE POLICY "Users can delete their own withdrawals"
    ON public.parts_withdrawals
    FOR DELETE
    USING (user_id = auth.uid());

-- Fonction pour décrémenter le stock d'une pièce
CREATE OR REPLACE FUNCTION public.decrement_part_stock(p_part_id BIGINT, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.parts_inventory
  SET quantity = quantity - p_quantity
  WHERE id = p_part_id AND quantity >= p_quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock insuffisant ou pièce non trouvée';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le stock de la pièce lors d'un retrait
CREATE OR REPLACE FUNCTION public.update_part_stock_on_withdrawal()
RETURNS TRIGGER AS $$
BEGIN
  -- Pas besoin d'appeler la fonction decrement_part_stock ici
  -- car elle sera appelée directement depuis le code de l'application
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
