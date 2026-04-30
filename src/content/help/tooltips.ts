export interface TooltipContent {
  title: string;
  body: string;
  articleId?: string;
}

export const tooltips = {
  // Équipements
  'equipment.status': {
    title: "Statut de l'équipement",
    body: "Operational : en service. Maintenance : en cours d'entretien. Repair : en réparation. Inactive : hors service.",
    articleId: 'equipment-organize',
  },
  'equipment.counters': {
    title: "Compteurs d'usure",
    body: "Heures pour les moteurs (tracteurs, moissonneuses), kilomètres pour les véhicules routiers. Mettez à jour régulièrement pour déclencher la maintenance préventive.",
  },
  'equipment.qr': {
    title: 'Code QR',
    body: "Imprimez et collez sur l'équipement. Scannez avec votre téléphone pour accéder rapidement à la fiche, l'historique et planifier une intervention.",
  },

  // Maintenance
  'maintenance.preventive': {
    title: 'Maintenance préventive',
    body: "Planifiée à intervalles réguliers (heures moteur, dates fixes) pour éviter les pannes. Idéale pour les vidanges, filtres, graissages.",
    articleId: 'maintenance-seasons',
  },
  'maintenance.corrective': {
    title: 'Maintenance corrective',
    body: "Intervention suite à une panne ou un dysfonctionnement constaté. À documenter pour suivre la fiabilité de votre flotte.",
  },
  'maintenance.priority': {
    title: 'Priorité',
    body: "Critique : à faire immédiatement (équipement bloqué). Élevée : sous quelques jours. Moyenne : à planifier. Faible : sans urgence.",
  },
  'maintenance.type': {
    title: 'Type de tâche',
    body: "Préventive : planifiée à l'avance (intervalles). Corrective : suite à une panne. Conditionnelle : déclenchée par un seuil ou une observation.",
  },

  // Pièces
  'parts.lowStock': {
    title: 'Seuil de stock bas',
    body: "Vous serez alerté quand le stock passe sous ce seuil. Définissez un niveau qui vous laisse le temps de commander.",
    articleId: 'parts-stock',
  },
  'parts.stock': {
    title: 'Stock disponible',
    body: "Quantité actuellement en stock. Mise à jour automatique lors des retraits liés à une intervention.",
  },

  // Points à surveiller
  'surveillance.status': {
    title: 'Statut',
    body: "En cours : action active. À surveiller : observation passive. Réglé : terminé, conservé pour l'historique.",
    articleId: 'surveillance-vs-intervention',
  },
  'surveillance.nextCheck': {
    title: 'Prochaine vérification',
    body: "Planifiez quand revérifier ce point (1, 3, 7, 14 jours ou date personnalisée). Vous serez alerté à la date prévue.",
  },

  // Dashboard
  'dashboard.widget.toCheck': {
    title: "À vérifier aujourd'hui",
    body: "Regroupe tous les points à surveiller dont la prochaine vérification est due aujourd'hui ou en retard.",
  },

  // Préparés pour Messages suivants
  'planning.recurring': {
    title: 'Tâche récurrente',
    body: "Se reproduit automatiquement (quotidienne, hebdomadaire, mensuelle). Idéale pour les routines (traite, alimentation).",
    articleId: 'daily-planning',
  },
  'planning.swipe': {
    title: 'Glisser pour terminer',
    body: "Sur mobile : glissez vers la droite pour terminer une tâche, vers la gauche pour la reporter au lendemain.",
  },
  'time.session': {
    title: 'Session de travail',
    body: "Démarrez un compteur lié à un équipement et une intervention. Utile pour la facturation client (ETA) et l'analyse des coûts.",
    articleId: 'time-tracking',
  },
  'roles.hierarchy': {
    title: 'Hiérarchie des rôles',
    body: "Owner : tous les droits sur la ferme. Admin : gère équipe et paramètres. Member : utilise au quotidien. Viewer : consultation uniquement.",
    articleId: 'invite-members',
  },

  // ===== Formulaire Équipement =====
  'equipment.field.type': {
    title: "Type d'équipement",
    body: "Catégorie principale (tracteur, moissonneuse, semoir, pulvérisateur, outil, autre). Détermine les compteurs d'usure adaptés et la maintenance suggérée.",
    articleId: 'how-to-create-equipment',
  },
  'equipment.field.model': {
    title: 'Modèle',
    body: "Modèle exact du constructeur, ex : 6155M, T7.230, MF 5713S. Aide à retrouver les bonnes pièces compatibles.",
  },
  'equipment.field.year': {
    title: 'Année',
    body: "Année de fabrication. Sert au calcul de l'âge de la machine et à choisir les pièces de la bonne génération.",
  },
  'equipment.field.serialNumber': {
    title: 'Numéro de série',
    body: "Identifiant unique gravé sur la machine (souvent sous le capot ou sur une plaque). Indispensable pour la garantie et les commandes de pièces.",
  },
  'equipment.field.purchaseDate': {
    title: "Date d'achat",
    body: "Date à laquelle l'équipement est entré dans la flotte. Sert à calculer l'amortissement et le coût annuel.",
  },
  'equipment.field.wearUnit': {
    title: "Unité d'usure",
    body: "Comment cet équipement s'use : heures moteur (tracteur), kilomètres (camion), acres travaillées, jours. Choisis celle qui pilote le mieux la maintenance.",
    articleId: 'how-to-create-equipment',
  },

  // ===== Formulaire Maintenance — NewTaskDialog =====
  'maintenance.field.dueDate': {
    title: "Date d'échéance",
    body: "Date à laquelle la tâche doit être terminée. Une tâche en retard apparaîtra en orange dans la liste.",
  },
  'maintenance.field.estimatedHours': {
    title: 'Durée estimée',
    body: "Combien de temps tu prévois pour cette intervention, en heures. Sert à planifier l'équipe et les créneaux d'atelier. Ex : 1.5 pour une vidange.",
  },
  'maintenance.field.trigger': {
    title: 'Seuil de déclenchement',
    body: "Optionnel : déclenche la maintenance automatiquement quand l'équipement atteint un compteur (heures moteur ou kilomètres). Ex : vidange à chaque 500h.",
    articleId: 'how-to-create-maintenance',
  },

  // ===== Formulaire Maintenance — MaintenancePlanForm (plan récurrent) =====
  'maintenance.field.frequency': {
    title: 'Fréquence',
    body: "Rythme de répétition du plan : quotidienne, hebdomadaire, mensuelle, annuelle… Choisis « Personnalisée » pour combiner intervalle + unité libre.",
    articleId: 'how-to-create-maintenance',
  },
  'maintenance.field.interval': {
    title: 'Intervalle',
    body: "Nombre de périodes entre chaque maintenance. Ex : intervalle 3 + fréquence mensuelle = tous les 3 mois.",
  },
  'maintenance.field.unit': {
    title: 'Unité',
    body: "Pour une fréquence personnalisée : jours, semaines, mois, années ou heures de fonctionnement.",
  },
  'maintenance.field.engineHoursEstimate': {
    title: 'Heures moteur estimées',
    body: "Durée estimée de l'intervention en heures de travail (pas le compteur de la machine). Ex : 0.5 pour un graissage, 4 pour un gros entretien.",
  },
  'maintenance.field.nextDueDate': {
    title: 'Prochaine maintenance',
    body: "Date de la première occurrence du plan. Les suivantes seront calculées automatiquement avec la fréquence.",
  },

  // ===== Formulaire Point à surveiller =====
  'point.field.type': {
    title: 'Type de point',
    body: "Catégorie de l'élément observé : animal, équipement, champ, bâtiment ou autre. Sert à filtrer et regrouper les points.",
    articleId: 'how-to-create-point',
  },
  'point.field.entityLabel': {
    title: 'Élément concerné',
    body: "Identification précise sur le terrain. Ex : Vache #142, Tracteur John Deere, Champ Nord, Étable laitière.",
  },
  'point.field.priority': {
    title: 'Priorité',
    body: "Critique : action immédiate (animal blessé, panne bloquante). Important : à traiter sous quelques jours. Normal : surveiller et planifier.",
    articleId: 'how-to-create-point',
  },

  // ===== Formulaire Pièce détachée =====
  'part.field.partNumber': {
    title: 'Référence',
    body: "Numéro de pièce du constructeur (souvent imprimé sur l'emballage). Ex : AF-JD-4290, RE522868. Indispensable pour commander la bonne pièce.",
    articleId: 'how-to-create-part',
  },
  'part.field.category': {
    title: 'Catégorie',
    body: "Type de pièce : filtres, moteur, transmission, hydraulique, etc. Aide au regroupement et à la recherche dans le stock.",
  },
  'part.field.location': {
    title: 'Emplacement',
    body: "Où la pièce est rangée physiquement. Ex : Entrepôt A, Atelier, Unité mobile. Permet de la retrouver vite.",
  },
  'part.field.compatibility': {
    title: 'Équipements compatibles',
    body: "Sélectionne les machines de ta flotte qui acceptent cette pièce. Permet de la suggérer automatiquement lors d'une intervention.",
    articleId: 'how-to-create-part',
  },

  // ===== Formulaire Planning — AddTaskForm =====
  'planning.field.category': {
    title: 'Catégorie',
    body: "Domaine de la tâche (animaux, champs, équipement…). Détermine la priorité automatique selon les réglages de ta ferme.",
    articleId: 'how-to-create-planning-task',
  },
  'planning.field.recurrenceDays': {
    title: 'Jours de la semaine',
    body: "Pour une récurrence personnalisée : coche les jours où la tâche doit revenir. Ex : Lun + Mer + Ven pour la traite.",
  },
  'planning.field.manualPriority': {
    title: 'Priorité manuelle',
    body: "Force une priorité (Critique / Important / À faire) qui prend le dessus sur la priorité automatique de la catégorie. « Automatique » la laisse calculée.",
    articleId: 'how-to-create-planning-task',
  },
  'planning.field.equipment': {
    title: 'Équipement lié',
    body: "Optionnel : associe la tâche à un tracteur ou outil. Pratique pour retrouver toutes les tâches d'une machine.",
  },
  'planning.field.fieldName': {
    title: 'Champ agricole',
    body: "Nom libre du champ concerné. Ex : Champ Nord, Parcelle Lac.",
  },
  'planning.field.buildingName': {
    title: 'Bâtiment',
    body: "Nom du bâtiment concerné. Ex : Étable principale, Hangar à grain.",
  },
  'planning.field.animalGroup': {
    title: "Groupe d'animaux",
    body: "Lot ou catégorie ciblée. Ex : Vaches laitières, Veaux 0-6 mois, Lot Nord.",
  },

  // ===== Formulaire Planning — TaskDetailDialog =====
  'planning.field.statusActions': {
    title: 'Actions de statut',
    body: "Commencer = passer la tâche en cours. Terminer = la marquer faite. Bloqué = signaler un blocage. Débloquer = revenir à faire.",
    articleId: 'how-to-create-planning-task',
  },
  'planning.field.postpone': {
    title: 'Reporter la tâche',
    body: "Décale la date d'échéance. Pour une tâche récurrente, seule cette occurrence est reportée, le rythme continue.",
  },

  // ===== Réglages — Priorité par catégorie =====
  'planning.field.categoryDefaultPriority': {
    title: 'Priorité par défaut',
    body: "Définit l'importance automatique de chaque catégorie pour la planification. Toute nouvelle tâche dans cette catégorie hérite de cette priorité (sauf si tu en mets une manuelle).",
    articleId: 'how-to-create-planning-task',
  },

  // ===== Suivi de temps — TimeEntryForm =====
  'time.field.taskType': {
    title: 'Type de tâche',
    body: "Nature du travail : entretien, réparation, inspection, opération ou autre. Sert au regroupement dans les rapports et à la facturation.",
    articleId: 'how-to-track-time',
  },
  'time.field.title': {
    title: 'Titre de la session',
    body: "Court descriptif de ce que tu vas faire. Ex : « Vidange tracteur 6155M », « Hersage Champ Nord ». Apparaît dans tous les rapports.",
  },
  'time.field.equipment': {
    title: 'Équipement utilisé',
    body: "Machine sur laquelle (ou avec laquelle) tu travailles. Permet d'imputer les heures à cet équipement et d'estimer son coût d'usage.",
    articleId: 'how-to-track-time',
  },
  'time.field.workstation': {
    title: 'Poste de travail',
    body: "À utiliser quand le travail n'est pas lié à une machine. Ex : Atelier, Bureau, Ferraillage. Alternative au champ Équipement.",
    articleId: 'how-to-track-time',
  },
  'time.field.location': {
    title: 'Lieu',
    body: "Localisation physique du travail. Ex : Atelier, Champ Nord, Hangar. Utile pour les rapports terrain et le suivi par zone.",
  },
  'time.field.description': {
    title: 'Description',
    body: "Contexte général de la session (objectif, conditions). Différent des notes terrain qui consignent les observations en cours de travail.",
  },

  // ===== Suivi de temps — Clôture de session =====
  'time.field.finalNotes': {
    title: 'Notes finales',
    body: "Bilan de la session : ce qui a été fait, problèmes rencontrés, à refaire la prochaine fois. Apparaît dans le rapport PDF.",
  },
  'time.field.material': {
    title: 'Matériel utilisé',
    body: "Type de consommable engagé pendant la session. Sert au calcul du coût total et au réapprovisionnement.",
  },
  'time.field.recurringClosure': {
    title: 'Tâche récurrente',
    body: "Crée automatiquement une nouvelle tâche identique pour la prochaine fois. Pratique pour les routines (graissage hebdo, contrôle quotidien).",
    articleId: 'how-to-track-time',
  },
  'time.field.managerVerified': {
    title: 'Vérifiée par gestionnaire',
    body: "Coche quand un responsable a validé la session. Utile pour la facturation client ou la paie des employés.",
  },
  'time.field.attachment': {
    title: 'Pièce jointe',
    body: "Ajoute une photo (avant/après, anomalie, plaque signalétique). Conservée avec la session, exportable dans le rapport.",
  },
  'time.field.export': {
    title: 'Export et envoi',
    body: "Génère un PDF de la session ou envoie le rapport par courriel. Pratique pour la facturation client ou l'archivage.",
  },
} as const satisfies Record<string, TooltipContent>;

export type TooltipKey = keyof typeof tooltips;