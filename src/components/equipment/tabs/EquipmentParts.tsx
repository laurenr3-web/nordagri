
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Equipment } from '@/services/supabase/equipmentService';
import { Part } from '@/types/Part';
import { getPartsForEquipment } from '@/services/supabase/partsService';
import EditPartForm from '@/components/parts/dialogs/form/EditPartForm';

interface EquipmentPartsProps {
  equipment: Equipment;
}

const EquipmentParts: React.FC<EquipmentPartsProps> = ({ equipment }) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoading(true);
        // Charger les pièces associées à cet équipement
        const equipmentParts = await getPartsForEquipment(equipment.id);
        setParts(equipmentParts);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching parts:', err);
        setError(err.message || 'Impossible de charger les pièces');
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, [equipment.id]);

  // Filtrer les pièces en fonction du terme de recherche
  const filteredParts = parts.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditPart = (part: Part) => {
    setSelectedPart(part);
    setIsEditDialogOpen(true);
  };

  const handlePartUpdated = (updatedPart: Part) => {
    // Mettre à jour l'état local avec la pièce mise à jour
    setParts(prevParts => 
      prevParts.map(part => 
        part.id === updatedPart.id ? updatedPart : part
      )
    );
    setIsEditDialogOpen(false);
    setSelectedPart(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pièces compatibles</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Chargement des pièces...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pièces compatibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive flex items-center justify-center py-8">
            <p>Erreur: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <CardTitle>Pièces compatibles</CardTitle>
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2 mt-2 md:mt-0">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une pièce
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredParts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Aucune pièce compatible trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>N° de pièce</TableHead>
                  <TableHead>Fabricant</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">{part.name}</TableCell>
                    <TableCell>{part.partNumber}</TableCell>
                    <TableCell>{part.manufacturer}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{part.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={part.stock <= part.reorderPoint ? "destructive" : "secondary"}
                      >
                        {part.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>{part.price.toFixed(2)} €</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditPart(part)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Dialog pour modifier une pièce */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier la pièce</DialogTitle>
            </DialogHeader>
            {selectedPart && (
              <EditPartForm 
                part={selectedPart} 
                onSubmit={handlePartUpdated}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EquipmentParts;
