
import React, { useEffect, useState } from 'react';
import { useEquipmentTable } from '@/hooks/equipment/useEquipmentTable';
import EquipmentTable from '@/components/equipment/table/EquipmentTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EquipmentFormDialog from '@/components/equipment/dialogs/EquipmentFormDialog';
import ImportEquipmentDialog from '@/components/equipment/dialogs/ImportEquipmentDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EquipmentGrid from '@/components/equipment/grid/EquipmentGrid';
import AuthDebugger from '@/components/auth/AuthDebugger';
import { checkAuthStatus } from '@/utils/authUtils';

const Equipment = () => {
  const {
    equipments,
    isLoading,
    pageCount,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    setSorting,
    sorting,
    fetchEquipments,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    importEquipments
  } = useEquipmentTable();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'table' | 'grid'>('table');
  const [showDebugger, setShowDebugger] = useState(false);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuthStatus();
    };
    verifyAuth();
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Équipements</h1>
            <p className="text-muted-foreground mt-1">
              Gérez votre parc d'équipements et leurs informations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowDebugger(!showDebugger)}
              size="sm"
            >
              {showDebugger ? 'Masquer débogueur' : 'Débogage Auth'}
            </Button>
            <Button onClick={() => setIsImportDialogOpen(true)} variant="outline">
              Importer
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter
            </Button>
          </div>
        </div>

        {showDebugger && <AuthDebugger />}

        <Tabs 
          defaultValue={currentView} 
          value={currentView} 
          onValueChange={(value) => setCurrentView(value as 'table' | 'grid')}
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="table">Liste</TabsTrigger>
              <TabsTrigger value="grid">Vignettes</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="table" className="mt-0">
            <EquipmentTable
              data={equipments || []}
              isLoading={isLoading}
              pageCount={pageCount}
              pageIndex={pageIndex}
              pageSize={pageSize}
              setPageIndex={setPageIndex}
              setPageSize={setPageSize}
              setSorting={setSorting}
              sorting={sorting}
              onDelete={deleteEquipment}
              onUpdate={updateEquipment}
            />
          </TabsContent>

          <TabsContent value="grid" className="mt-4">
            <EquipmentGrid
              equipment={equipments || []}
              isLoading={isLoading}
              onDelete={deleteEquipment}
            />
          </TabsContent>
        </Tabs>
      </div>

      <EquipmentFormDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={createEquipment}
        title="Ajouter un équipement"
      />

      <ImportEquipmentDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={(importedData) => {
          importEquipments(importedData);
          setIsImportDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Equipment;
