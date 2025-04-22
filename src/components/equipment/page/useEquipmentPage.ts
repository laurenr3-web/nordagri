
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useEquipmentFilters, EquipmentItem } from "../hooks/useEquipmentFilters";

/**
 * Hook métier pour la logique de la page Equipements.
 * - Gère la vue en cours (table/grid)
 * - Restaure/conserve la préférence utilisateur
 * - Gère l’équipement sélectionné
 * - Centralise les handlers métiers (détail, etc.)
 * @param equipment La liste complète des équipements à afficher
 * @returns Etat et handlers pour la page
 */
export function useEquipmentPage(equipment: EquipmentItem[]) {
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);

  const filterState = useEquipmentFilters(equipment);
  const navigate = useNavigate();

  // restauration du choix de vue au chargement
  useEffect(() => {
    const savedView = localStorage.getItem("equipmentViewPreference");
    if (savedView === "grid" || savedView === "list") {
      setCurrentView(savedView);
    }
  }, []);

  // sauvegarde auto de la vue préférée
  useEffect(() => {
    localStorage.setItem("equipmentViewPreference", currentView);
  }, [currentView]);

  /**
   * Handler d'ouverture de fiche détail équipement
   * @param equipment Equipement cliqué
   */
  const handleEquipmentClick = useCallback((equipment: EquipmentItem) => {
    navigate(`/equipment/${equipment.id}`);
  }, [navigate]);

  /**
   * Ferme la modale détail (système legacy)
   */
  const handleDialogClose = () => {
    setSelectedEquipment(null);
  };

  return {
    currentView,
    setCurrentView,
    selectedEquipment,
    setSelectedEquipment,
    filterState,
    handleEquipmentClick,
    handleDialogClose,
  };
}
