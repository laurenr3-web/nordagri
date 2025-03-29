
import React, { useState, useEffect } from 'react';
import { partsData } from '@/data/partsData';
import { Part } from '@/types/Part';
import { toast } from 'sonner';
import { Eye, Grid, List, PlusCircle, Trash, X } from 'lucide-react';

// Composants UI simplifiés pour éviter les problèmes d'interactivité
const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  className = '',
  icon,
}: { 
  children: React.ReactNode; 
  onClick: (e: React.MouseEvent) => void; 
  variant?: 'default' | 'outline' | 'destructive'; 
  className?: string;
  icon?: React.ReactNode;
}) => {
  const baseStyle = "px-4 py-2 rounded font-medium focus:outline-none flex items-center gap-2";
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };
  
  return (
    <button 
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      onClick={(e) => {
        // Empêcher la propagation des événements
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }}
    >
      {icon}
      {children}
    </button>
  );
};

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button 
            className="text-muted-foreground hover:text-foreground rounded-full p-1" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const EmergencyParts = () => {
  // État de base
  const [parts, setParts] = useState<Part[]>(partsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'list'>(() => {
    const savedView = localStorage.getItem('partsView');
    return (savedView === 'grid' || savedView === 'list') ? savedView : 'grid';
  });
  
  // États des modales
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  
  // État du formulaire d'ajout
  const [newPart, setNewPart] = useState<Omit<Part, 'id' | 'compatibility'>>({
    name: '',
    partNumber: '',
    category: 'filters',
    manufacturer: '',
    price: 0,
    stock: 0,
    location: '',
    reorderPoint: 5,
    image: 'https://placehold.co/200x200?text=New+Part'
  });
  
  // Filtrer les pièces en fonction du terme de recherche
  const filteredParts = parts.filter(part => {
    if (searchTerm === '') return true;
    
    return (
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (part.manufacturer && part.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  // Sauvegarder la préférence de vue
  useEffect(() => {
    localStorage.setItem('partsView', view);
  }, [view]);
  
  // Fonctions pour gérer les pièces
  const handleAddPart = () => {
    // Validation de base
    if (!newPart.name || !newPart.partNumber) {
      toast("Veuillez remplir les champs obligatoires", {
        description: "Le nom et la référence sont requis",
        action: {
          label: "Fermer",
          onClick: () => {}
        }
      });
      return;
    }
    
    // Créer une nouvelle pièce avec un ID unique
    const partToAdd: Part = {
      ...newPart,
      id: Date.now().toString(),
      compatibility: []
    };
    
    // Ajouter à l'état
    setParts([...parts, partToAdd]);
    
    // Notification et nettoyage
    toast("Pièce ajoutée", {
      description: `Pièce "${partToAdd.name}" ajoutée avec succès`
    });

    setAddModalOpen(false);
    setNewPart({
      name: '',
      partNumber: '',
      category: 'filters',
      manufacturer: '',
      price: 0,
      stock: 0,
      location: '',
      reorderPoint: 5,
      image: 'https://placehold.co/200x200?text=New+Part'
    });
  };
  
  const handleViewDetails = (part: Part) => {
    setSelectedPart(part);
    setDetailsModalOpen(true);
  };
  
  const handleDeletePart = (partId: string | number) => {
    setParts(parts.filter(p => p.id !== partId));
    toast("Pièce supprimée", {
      description: "La pièce a été supprimée avec succès"
    });
    setDetailsModalOpen(false);
    setSelectedPart(null);
  };
  
  // Rendu de l'interface d'urgence
  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des pièces (Mode d'urgence)</h1>
      
      {/* Barre d'outils */}
      <div className="bg-card p-4 rounded shadow mb-6 flex flex-wrap gap-4 justify-between">
        <div className="w-full max-w-md">
          <input 
            type="text"
            placeholder="Rechercher une pièce..."
            className="w-full px-4 py-2 border rounded bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <div className="flex rounded border bg-card overflow-hidden">
            <button 
              className={`px-3 py-2 flex items-center ${view === 'grid' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
              onClick={() => setView('grid')}
            >
              <Grid size={18} className="mr-1" />
              Grille
            </button>
            <button 
              className={`px-3 py-2 flex items-center ${view === 'list' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
              onClick={() => setView('list')}
            >
              <List size={18} className="mr-1" />
              Liste
            </button>
          </div>
          
          <Button 
            onClick={() => setAddModalOpen(true)}
            icon={<PlusCircle size={18} />}
          >
            Ajouter
          </Button>
        </div>
      </div>
      
      {/* Contenu principal - affichage des pièces */}
      {filteredParts.length === 0 ? (
        <div className="bg-card p-8 rounded shadow text-center">
          <p className="text-muted-foreground">Aucune pièce trouvée</p>
          {searchTerm && (
            <Button 
              variant="outline"
              className="mt-4"
              onClick={() => setSearchTerm('')}
            >
              Effacer la recherche
            </Button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredParts.map(part => (
            <div key={part.id} className="bg-card rounded shadow overflow-hidden hover:shadow-md">
              <div className="relative">
                <img 
                  src={part.image || 'https://placehold.co/200x200?text=No+Image'} 
                  alt={part.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => handleViewDetails(part)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Error';
                  }}
                />
                {part.stock <= (part.reorderPoint || 0) && (
                  <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                    Stock faible
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium">{part.name}</h3>
                <p className="text-sm text-muted-foreground">{part.partNumber}</p>
                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                  <div>
                    <p className="text-muted-foreground">Prix:</p>
                    <p>${part.price?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stock:</p>
                    <p className={part.stock <= (part.reorderPoint || 0) ? 'text-destructive' : ''}>
                      {part.stock} unités
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  className="mt-4 w-full justify-center"
                  onClick={() => handleViewDetails(part)}
                  icon={<Eye size={16} />}
                >
                  Détails
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50">
                <th className="p-3 text-left">Nom</th>
                <th className="p-3 text-left">Référence</th>
                <th className="p-3 text-left">Prix</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredParts.map(part => (
                <tr key={part.id} className="hover:bg-secondary/30">
                  <td className="p-3">{part.name}</td>
                  <td className="p-3">{part.partNumber}</td>
                  <td className="p-3">${part.price?.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={part.stock <= (part.reorderPoint || 0) ? 'text-destructive' : ''}>
                      {part.stock} unités
                    </span>
                  </td>
                  <td className="p-3">
                    <Button 
                      variant="outline"
                      className="text-xs h-8 px-2"
                      onClick={() => handleViewDetails(part)}
                      icon={<Eye size={14} />}
                    >
                      Détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal d'ajout de pièce */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Ajouter une pièce"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Nom *</label>
            <input 
              type="text"
              value={newPart.name}
              onChange={(e) => setNewPart({...newPart, name: e.target.value})}
              className="w-full px-3 py-2 border rounded bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1">Référence *</label>
            <input 
              type="text"
              value={newPart.partNumber}
              onChange={(e) => setNewPart({...newPart, partNumber: e.target.value})}
              className="w-full px-3 py-2 border rounded bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1">Catégorie</label>
            <select 
              value={newPart.category}
              onChange={(e) => setNewPart({...newPart, category: e.target.value})}
              className="w-full px-3 py-2 border rounded bg-background"
            >
              <option value="filters">Filtres</option>
              <option value="engine">Moteur</option>
              <option value="hydraulic">Hydraulique</option>
              <option value="electrical">Électrique</option>
              <option value="drive">Transmission</option>
              <option value="brake">Freinage</option>
              <option value="cooling">Refroidissement</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Fabricant</label>
            <input 
              type="text"
              value={newPart.manufacturer}
              onChange={(e) => setNewPart({...newPart, manufacturer: e.target.value})}
              className="w-full px-3 py-2 border rounded bg-background"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Prix</label>
              <input 
                type="number"
                min="0"
                step="0.01"
                value={newPart.price}
                onChange={(e) => setNewPart({...newPart, price: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border rounded bg-background"
              />
            </div>
            
            <div>
              <label className="block mb-1">Stock</label>
              <input 
                type="number"
                min="0"
                value={newPart.stock}
                onChange={(e) => setNewPart({...newPart, stock: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border rounded bg-background"
              />
            </div>
            
            <div>
              <label className="block mb-1">Seuil de réapprovisionnement</label>
              <input 
                type="number"
                min="0"
                value={newPart.reorderPoint}
                onChange={(e) => setNewPart({...newPart, reorderPoint: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border rounded bg-background"
              />
            </div>
            
            <div>
              <label className="block mb-1">Emplacement</label>
              <input 
                type="text"
                value={newPart.location}
                onChange={(e) => setNewPart({...newPart, location: e.target.value})}
                className="w-full px-3 py-2 border rounded bg-background"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setAddModalOpen(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAddPart}
          >
            Ajouter
          </Button>
        </div>
      </Modal>
      
      {/* Modal de détail de pièce */}
      <Modal
        isOpen={detailsModalOpen && selectedPart !== null}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedPart(null);
        }}
        title="Détails de la pièce"
      >
        {selectedPart && (
          <>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <img
                  src={selectedPart.image || 'https://placehold.co/200x200?text=No+Image'}
                  alt={selectedPart.name}
                  className="w-full object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Error';
                  }}
                />
              </div>
              
              <div className="w-full md:w-2/3 space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{selectedPart.name}</h3>
                  <p className="text-muted-foreground">{selectedPart.partNumber}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Prix</p>
                    <p className="font-medium">${selectedPart.price?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <p className={`font-medium ${selectedPart.stock <= (selectedPart.reorderPoint || 0) ? 'text-destructive' : ''}`}>
                      {selectedPart.stock} unités
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fabricant</p>
                    <p className="font-medium">{selectedPart.manufacturer || "Non spécifié"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Catégorie</p>
                    <p className="font-medium">{selectedPart.category || "Non classé"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Emplacement</p>
                    <p className="font-medium">{selectedPart.location || "Non spécifié"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seuil de réapprovisionnement</p>
                    <p className="font-medium">{selectedPart.reorderPoint || 0} unités</p>
                  </div>
                </div>
                
                {selectedPart.compatibility && selectedPart.compatibility.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Compatible avec:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedPart.compatibility.map((item, index) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button
                variant="destructive"
                onClick={() => handleDeletePart(selectedPart.id)}
                icon={<Trash size={16} />}
              >
                Supprimer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedPart(null);
                }}
              >
                Fermer
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default EmergencyParts;
