
# Architecture Technique - Nordagri ERP

## Vue d'ensemble

Nordagri est une application de gestion d'équipements agricoles construite sur une architecture moderne orientée composants avec React et Supabase comme backend. Ce document présente les principes architecturaux, les flux de données et les patterns utilisés dans l'application.

## Diagramme d'architecture

```
┌──────────────────────────────┐      ┌──────────────────────────────┐
│                              │      │                              │
│  Interface Utilisateur       │      │  Supabase                    │
│  ┌──────────────────────┐    │      │  ┌──────────────────────┐    │
│  │ Pages                │    │      │  │ Tables               │    │
│  │ ├─ Dashboard         │    │      │  │ ├─ equipment         │    │
│  │ ├─ Equipment         │    │      │  │ ├─ maintenance_tasks │    │
│  │ ├─ Maintenance       │───────────────┤ ├─ time_sessions    │    │
│  │ ├─ Parts             │    │      │  │ ├─ fuel_logs         │    │
│  │ ├─ TimeTracking      │    │      │  │ ├─ parts_inventory   │    │
│  │ └─ Settings          │    │      │  │ └─ profiles          │    │
│  └──────────────────────┘    │      │  └──────────────────────┘    │
│            │                  │      │            │                  │
│  ┌─────────▼──────────┐      │      │  ┌─────────▼──────────┐      │
│  │ Hooks              │      │      │  │ Fonctionnalités    │      │
│  │ ├─ useEquipment    │      │      │  │ ├─ Authentification│      │
│  │ ├─ useMaintenance  │──────┼──────┼──┤ ├─ Stockage        │      │
│  │ ├─ useTimeTracking │      │      │  │ ├─ Base de données │      │
│  │ ├─ useParts        │      │      │  │ ├─ RLS             │      │
│  │ └─ useRealtime     │      │      │  │ └─ Realtime        │      │
│  └──────────────────────┘    │      │  └──────────────────────┘    │
│            │                  │      │                              │
│  ┌─────────▼──────────┐      │      │                              │
│  │ État Global        │      │      │                              │
│  │ └─ Zustand Store   │      │      │                              │
│  └──────────────────────┘    │      │                              │
│                              │      │                              │
└──────────────────────────────┘      └──────────────────────────────┘
```

## Architecture des couches

L'application suit une architecture en couches clairement séparées:

### 1. Couche de présentation (UI)
- **Composants React** (`/src/components/`)
  - Organisés par domaine fonctionnel (equipment, maintenance, parts, etc.)
  - Composants UI réutilisables et atomiques (`/src/components/ui/`)
  - Responsive design avec Tailwind CSS

### 2. Couche logique (Hooks)
- **Custom Hooks** (`/src/hooks/`)
  - Encapsulation de la logique métier
  - Gestion des requêtes API avec React Query
  - Gestion d'état local et dérivé

### 3. Couche de services
- **Services d'intégration** (`/src/services/`)
  - Communication avec Supabase
  - Adaptation des données

### 4. Couche de données
- **Modèles et types** (`/src/types/`, `/src/data/models/`)
  - Définitions TypeScript des entités
  - Validation avec Zod

## Flux de données

### Flux principal

```
[Composant UI] → [Custom Hook] → [Service] → [Supabase] → [Base de données]
       ↑                                           |
       └───────────────────────────────────────────┘
```

1. L'utilisateur interagit avec un composant UI
2. Le composant appelle un hook personnalisé
3. Le hook utilise un service pour communiquer avec Supabase
4. Supabase exécute la requête sur la base de données
5. Les données sont retournées au composant via le hook

### Exemple concret : Gestion d'équipement

```
[EquipmentGrid] → [useEquipmentData] → [equipmentService] → [Supabase] → [equipment table]
       ↑                                                        |
       └────────────────────────────────────────────────────────┘
```

### Flux temps réel

```
[Supabase Realtime] → [useRealtimeSubscription] → [invalidateQueries] → [React Query] → [UI]
```

1. Un changement se produit dans la base de données
2. Supabase Realtime notifie l'application via un canal de souscription
3. Le hook `useRealtimeSubscription` détecte le changement
4. React Query invalide les requêtes concernées
5. Les composants UI sont automatiquement mis à jour

## Patterns principaux

### 1. État global avec Zustand

```typescript
// Exemple simplifié du store Zustand
const useGlobalStore = create<GlobalState>((set) => ({
  currentUser: null,
  currentFarmId: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentFarmId: (farmId) => set({ currentFarmId: farmId })
}));
```

**Avantages:**
- Minimaliste et performant
- Compatible avec les DevTools React
- Permet le découpage en slices logiques

### 2. Gestion des requêtes avec TanStack Query

```typescript
// Pattern typique d'utilisation de React Query
export function useEquipmentData() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: fetchEquipment,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}
```

**Avantages:**
- Gestion du cache, des états de chargement et d'erreur
- Revalidation automatique
- Déduplications des requêtes
- Invalidation fine du cache

### 3. Composition de hooks personnalisés

```typescript
// Pattern de composition de hooks
export function useEquipmentPage() {
  const { data, isLoading } = useEquipmentData();
  const { filters, setFilters } = useEquipmentFilters();
  const { addEquipment } = useEquipmentMutations();
  
  // Logique spécifique à la page
  return { 
    equipment: data, 
    isLoading, 
    filters, 
    setFilters, 
    addEquipment 
  };
}
```

**Avantages:**
- Séparation des préoccupations
- Réutilisabilité des hooks
- Testabilité améliorée
- Découplage de la logique et de l'UI

### 4. Synchronisation temps réel avec Supabase Realtime

```typescript
// Pattern d'utilisation du realtime
export function useRealtimeSubscription({ tableName, onUpdate }) {
  useEffect(() => {
    const channel = supabase
      .channel(`table-changes-${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, 
        (payload) => {
          onUpdate(payload);
        })
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [tableName, onUpdate]);
}
```

## Bonnes pratiques

### Gestion de l'état

1. **Hiérarchie d'état claire:**
   - État global (Zustand): authentification, préférences utilisateur
   - État de requête (React Query): données du serveur
   - État local (useState): UI temporaire, formulaires

2. **Normalisation des données:**
   - Structure plate pour les entités
   - Relations par ID plutôt que par imbrication

3. **État dérivé vs. état stocké:**
   - Calcul à la volée des données dérivées plutôt que stockage redondant
   - Utilisation de sélecteurs et de mémoïsation

### Navigation

1. **Routing avec React Router:**
   - Organisation par fonctionnalité
   - Protection des routes authentifiées
   - Paramètres d'URL pour les filtres et identifiants

2. **Navigation programmatique:**
   - Utilisation de `useNavigate` dans les hooks
   - Transmission des ID dans les URLs

3. **Gestion du contexte de navigation:**
   - Sauvegarde de l'état des filtres et de la pagination
   - Retour intelligent avec préservation du contexte

### Intégration Supabase

1. **Politiques de sécurité (RLS):**
   - Application du principe de moindre privilège
   - Sécurisation par utilisateur et par ferme

2. **Optimisation des requêtes:**
   - Sélection précise des colonnes
   - Pagination et filtrage côté serveur
   - Requêtes composées

3. **Gestion temps réel:**
   - Abonnements ciblés par table
   - Reconnexion avec backoff exponentiel
   - Invalidation intelligente du cache Query

4. **Transactions et cohérence:**
   - Utilisation de fonctions PostgreSQL pour les opérations complexes
   - Validation côté serveur avec contraintes

## Cycle de vie des données

### Ajout d'un équipement
1. L'utilisateur remplit le formulaire d'équipement
2. La validation Zod vérifie les données
3. Le hook `useEquipmentMutations` appelle la mutation d'ajout
4. Le service envoie les données à Supabase
5. React Query invalide la requête d'équipements
6. L'UI est mise à jour avec le nouvel équipement
7. Les abonnés Realtime sont notifiés du changement

### Mise à jour d'une tâche de maintenance
1. L'utilisateur modifie le statut d'une tâche
2. Le hook `useMaintenanceMutations` appelle la mutation de mise à jour
3. Le service envoie les données à Supabase
4. Supabase met à jour la base de données et déclenche un événement Realtime
5. Les abonnés Realtime reçoivent la notification
6. React Query invalide les requêtes concernées
7. L'UI est mise à jour pour tous les utilisateurs connectés

## Considérations et perspectives

### Performance
- Utilisation de la pagination pour les listes longues
- Chargement différé des images et ressources lourdes
- Mémoïsation des composants et valeurs calculées

### Extensibilité
- Architecture modulaire par domaine
- Hooks composables pour la réutilisation
- Types génériques pour les adaptateurs de données

### Fiabilité
- Gestion des erreurs à tous les niveaux
- Reconnexion automatique pour le temps réel
- Validation des données entrantes et sortantes

### Améliorations futures
- Mise en cache offline avec IndexedDB
- Synchronisation différée pour le mode hors connexion
- Optimisation des requêtes avec des vues matérialisées
- Tests automatisés plus complets
