
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Part } from '@/types/Part';
import { Loader2, AlertCircle, Search, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface EquipmentPartsCompatibleProps {
  equipmentId: number | string;
}

const EquipmentPartsCompatible: React.FC<EquipmentPartsCompatibleProps> = ({ equipmentId }) => {
  const [compatibleParts, setCompatibleParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompatibleParts = async () => {
      if (!equipmentId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Convertir l'ID en chaîne pour la comparaison dans le tableau compatibility
        const equipmentIdString = equipmentId.toString();
        
        const { data, error } = await supabase
          .from('parts_inventory')
          .select('*')
          .contains('compatible_with', [equipmentIdString]);
        
        if (error) {
          console.error('Error fetching compatible parts:', error);
          setError('Impossible de charger les pièces compatibles');
          return;
        }
        
        if (data) {
          // Convertir les données en format Part
          const parts: Part[] = data.map(part => ({
            id: part.id,
            name: part.name,
            partNumber: part.part_number || '',
            category: part.category || '',
            manufacturer: part.supplier || '',
            compatibility: part.compatible_with || [],
            stock: part.quantity || 0,
            price: part.unit_price || 0,
            location: part.location || '',
            reorderPoint: part.reorder_threshold || 5,
            image: part.image_url || 'https://placehold.co/100x100/png'
          }));
          
          setCompatibleParts(parts);
        }
      } catch (err) {
        console.error('Unexpected error fetching compatible parts:', err);
        setError('Une erreur inattendue est survenue');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompatibleParts();
  }, [equipmentId]);

  const viewPartDetails = (part: Part) => {
    // Afficher les détails de la pièce ou naviguer vers la page de la pièce
    navigate(`/parts?id=${part.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          Pièces compatibles
          {compatibleParts.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {compatibleParts.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Pièces détachées associées à cet équipement
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Chargement des pièces...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <span className="ml-2 text-destructive">{error}</span>
          </div>
        ) : compatibleParts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Aucune pièce compatible n'a été associée à cet équipement.</p>
            <Button 
              variant="link" 
              className="mt-2" 
              onClick={() => navigate('/parts')}
            >
              Gérer les pièces
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {compatibleParts.map((part) => (
              <div
                key={part.id}
                className="group flex items-center justify-between rounded-md border p-2 hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden">
                    <img
                      src={part.image}
                      alt={part.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/100x100/png';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium truncate">{part.name}</h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="truncate">{part.partNumber}</span>
                      <Separator orientation="vertical" className="mx-2 h-3" />
                      <span className="truncate">{part.manufacturer}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right mr-2">
                    <div className="font-medium">{part.price.toFixed(2)}€</div>
                    <div className={`text-sm ${part.stock <= 0 ? 'text-destructive' : part.stock <= part.reorderPoint ? 'text-amber-500' : 'text-green-500'}`}>
                      Stock: {part.stock}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-70 group-hover:opacity-100"
                    onClick={() => viewPartDetails(part)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Voir les détails</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentPartsCompatible;
