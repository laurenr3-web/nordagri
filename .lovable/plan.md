# Implémentation — Bouton "Observation" → Formulaire "Point à surveiller"

Validation reçue : on garde l'option 1 (lien stocké en texte via `entity_label`, pas de migration DB), avec les 2 précisions de l'utilisateur intégrées (useRef pour la transition false→true, et construction lisible de `entityLabel`).

## Fichier 1 — `src/components/points/NewPointDialog.tsx`

Ajouter le support de `defaultValues` de manière non destructive.

**Changements** :
- Ajouter `useEffect, useRef` aux imports React.
- Étendre l'interface `Props` :
  ```ts
  defaultValues?: {
    type?: PointType;
    entityLabel?: string;
    priority?: PointPriority;
    title?: string;
  };
  ```
- Initialiser les `useState` en lisant `defaultValues` au premier mount (les valeurs initiales restent les mêmes par défaut).
- Ajouter le `useEffect` de reset uniquement à la transition `false → true`, via `wasOpenRef` :
  ```tsx
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setType(defaultValues?.type ?? 'autre');
      setEntityLabel(defaultValues?.entityLabel ?? '');
      setPriority(defaultValues?.priority ?? 'normal');
      setTitle(defaultValues?.title ?? '');
      setNote('');
      setPhotoFile(null);
    }
    wasOpenRef.current = open;
  }, [open, defaultValues]);
  ```
- `handleSubmit`, validation, mutation : **inchangés**.

## Fichier 2 — `src/components/equipment/detail/EquipmentDetailContent.tsx`

- Ajouter imports : `NewPointDialog`, `useFarmId`, `logger`.
- Ajouter state : `const [observationOpen, setObservationOpen] = useState(false);` et récupérer `farmId` via `useFarmId()`.
- Construire `entityLabel` lisiblement :
  ```ts
  const observationEntityLabel = (() => {
    const parts: string[] = [];
    if (localEquipment.name) parts.push(localEquipment.name);
    if (localEquipment.model) parts.push(localEquipment.model);
    if (localEquipment.year) parts.push(`(${localEquipment.year})`);
    return parts.join(' ');
  })();
  ```
- Remplacer la callback `onObservation` :
  ```tsx
  onObservation={() => {
    if (!farmId) {
      logger.error('[Equipment] Could not open surveillance form: no farmId');
      toast.error('Une erreur est survenue, réessayez');
      return;
    }
    setObservationOpen(true);
  }}
  ```
- Rendre le dialog après les autres dialogs :
  ```tsx
  {farmId && (
    <NewPointDialog
      open={observationOpen}
      onOpenChange={setObservationOpen}
      farmId={farmId}
      defaultValues={{
        type: 'equipement',
        entityLabel: observationEntityLabel,
      }}
    />
  )}
  ```

## Hors changements

- `useCreatePoint` : non modifié.
- Schéma DB : non modifié.
- `PointsPage` : non modifié → zéro régression sur création standard.
- `QuickActions.tsx` : non modifié (le bouton reste tel quel).

## Mémoire à mettre à jour

`mem://logic/equipment-quick-action-links` mentionne « pre-fills equipment ID in URL for Maintenance and Observation forms ». À mettre à jour : Observation n'utilise plus une URL/route mais ouvre directement le `NewPointDialog` pré-rempli.
