
# Composants de détails des pièces

Ce répertoire contient des composants pour afficher les détails des pièces.

## PartCompatibility

Affiche les équipements et machines compatibles avec une pièce spécifique.

### Props

| Nom | Type | Description |
|-----|------|-------------|
| `compatibility` | `string[] \| undefined` | Tableau de noms d'équipements compatibles |

### Exemple d'utilisation

```tsx
import PartCompatibility from '@/components/parts/details/PartCompatibility';

// Dans un composant React
<PartCompatibility compatibility={["John Deere 6920", "Kubota M7060"]} />

// Avec des données pouvant être undefined
<PartCompatibility compatibility={part.compatibility} />
```

### Bonnes pratiques

1. Toujours fournir un tableau de chaînes pour `compatibility`, même s'il est vide
2. Assurez-vous que les données venant de l'API sont correctement transformées en tableaux de chaînes
3. N'utilisez pas de tableaux d'objets pour `compatibility`, utilisez plutôt des tableaux de chaînes ou d'IDs

### Tests

Des tests unitaires sont disponibles dans le dossier `__tests__` pour garantir un comportement correct :

```bash
npm test -- PartCompatibility
```
