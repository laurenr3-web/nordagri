
import { useQuery } from '@tanstack/react-query';
import { Part } from '@/types/Part';
import { getParts } from '@/services/supabase/parts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { compatibilityToNumbers } from '@/utils/compatibilityConverter';

export function usePartsData() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['parts'],
    queryFn: async () => {
      try {
        // Vérifier d'abord l'état de l'authentification
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('❌ Erreur de session:', sessionError.message);
          throw new Error(`Erreur d'authentification: ${sessionError.message}`);
        }
        
        if (!session.session) {
          console.warn('⚠️ Aucune session active, l\'utilisateur n\'est pas connecté');
          console.warn('⚠️ Les politiques RLS empêcheront probablement l\'accès aux données');
          // Note: on continue quand même la requête pour voir si des politiques RLS permettent l'accès
        } else {
          console.log('🔑 Session active pour l\'utilisateur:', session.session.user.id);
        }
        
        console.log('🔄 Appel du service getParts...');
        
        let partsData = await getParts();
        
        console.log('📦 Données de pièces reçues:', partsData);
        console.log(`📊 Nombre de pièces récupérées: ${partsData.length}`);
        
        // Standardize compatibility to always be number[]
        partsData = partsData.map(part => ({
          ...part,
          compatibility: compatibilityToNumbers(part.compatibility)
        }));
        
        // Vérifier si des données ont été retournées
        if (partsData.length === 0) {
          console.warn('⚠️ Aucune pièce trouvée dans la base de données');
        }
        
        return partsData as Part[];
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des pièces:', error);
        
        // Afficher des informations plus détaillées sur l'erreur
        if (error instanceof Error) {
          console.error('❌ Détail de l\'erreur:', error.message);
          console.error('❌ Stack trace:', error.stack);
        }
        
        toast({
          title: "Erreur de chargement",
          description: error instanceof Error ? error.message : "Impossible de charger les pièces",
          variant: "destructive",
        });
        
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
