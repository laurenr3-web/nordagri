/**
 * Translates raw work type identifiers (often English) into French labels
 * used across the Time Tracking statistics UI.
 */
export function translateWorkType(type?: string | null): string {
  if (!type) return "Autre";
  const normalized = type.toLowerCase().trim().replace(/[_-]+/g, " ");
  const translations: Record<string, string> = {
    other: "Autre",
    autre: "Autre",
    cleaning: "Nettoyage",
    nettoyage: "Nettoyage",
    fieldwork: "Travaux aux champs",
    "field work": "Travaux aux champs",
    "travaux aux champs": "Travaux aux champs",
    maintenance: "Maintenance",
    repair: "Réparation",
    "réparation": "Réparation",
    inspection: "Inspection",
    operation: "Opération",
    "opération": "Opération",
    animals: "Animaux",
    animal: "Animaux",
    animaux: "Animaux",
    equipment: "Équipement",
    "équipement": "Équipement",
    building: "Bâtiments",
    buildings: "Bâtiments",
    "bâtiments": "Bâtiments",
    admin: "Administration",
    administration: "Administration",
    feeding: "Alimentation",
    alimentation: "Alimentation",
    fields: "Champs",
    field: "Champs",
    champs: "Champs",
    crops: "Cultures",
    cultures: "Cultures",
    general: "Général",
    "général": "Général",
    "non spécifié": "Non spécifié",
    "non specifie": "Non spécifié",
  };
  if (translations[normalized]) return translations[normalized];
  // Fallback: capitalize the original input
  const trimmed = type.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}