
# Guide des Tests

## Vue d'ensemble
Le projet utilise Vitest comme framework de test avec une configuration qui assure une couverture minimale de 80% pour le code. Les tests sont organisés pour couvrir à la fois les tests unitaires et d'intégration.

## Configuration
La configuration des tests se trouve dans `vitest.config.ts` et inclut:
- Environnement JSDOM pour simuler le navigateur
- Rapports de couverture configurés à 80% minimum
- Alias de chemin pour simplifier les imports

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Structure des tests
Les tests sont organisés dans le dossier `/src/tests` et suivent une structure similaire à celle des composants et services qu'ils testent.

```
src/
├── tests/
│   ├── fuelLog.test.ts      # Tests pour les logs de carburant
│   ├── equipmentUnit.test.ts # Tests unitaires pour l'équipement
│   ├── timeTracking.test.ts  # Tests pour le suivi du temps
│   └── ... (autres tests)
```

## Types de tests

### Tests unitaires
Testent des fonctions ou des composants individuels de manière isolée.

Exemple de test unitaire (`equipmentUnit.test.ts`):
```typescript
import { describe, it, expect, vi } from 'vitest';
import { equipmentService } from '@/services/supabase/equipmentService';

describe('EquipmentService', () => {
  it('should fetch equipment list', async () => {
    vi.spyOn(equipmentService, 'getEquipment').mockResolvedValue([
      { id: 1, name: 'Test Tractor', status: 'operational' }
    ]);
    const result = await equipmentService.getEquipment();
    expect(result[0].name).toBe('Test Tractor');
  });

  // ...autres tests
});
```

### Tests d'intégration
Testent l'interaction entre plusieurs composants ou services.

Exemple de test d'intégration (`fuelLog.test.ts`):
```typescript
import { describe, it, expect, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('FuelLog Integration', () => {
  it('should fetch fuel logs for an equipment', async () => {
    const mockOrderFn = vi.fn().mockReturnValue({
      data: [{ id: '1', fuel_quantity_liters: 20 }],
      error: null
    });
    
    const mockEqFn = vi.fn().mockReturnValue({
      order: mockOrderFn
    });
    
    const mockSelectFn = vi.fn().mockReturnValue({
      eq: mockEqFn
    });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: mockSelectFn
    } as any);
    
    const { data } = await supabase
      .from('fuel_logs')
      .select('*')
      .eq('equipment_id', 1)
      .order('date', { ascending: false });

    expect(data[0].fuel_quantity_liters).toBe(20);
  });
});
```

## Mocks et stubs
Vitest fournit des outils puissants pour créer des mocks:

```typescript
// Mock d'un service complet
vi.mock('@/services/supabase/equipmentService', () => ({
  equipmentService: {
    getEquipment: vi.fn(),
    getEquipmentById: vi.fn()
  }
}));

// Mock d'une fonction spécifique
vi.spyOn(timeTrackingService, 'getTimeEntries').mockResolvedValue([mockTimeEntry]);
```

## Bonnes pratiques de test

### Structure recommandée
Chaque test devrait suivre le modèle AAA (Arrange-Act-Assert):
1. **Arrange** - Préparer les données et conditions
2. **Act** - Exécuter l'action à tester
3. **Assert** - Vérifier les résultats

### Isolation des tests
- Chaque test doit être indépendant
- Utiliser `beforeEach` pour réinitialiser l'état entre les tests
- Éviter les dépendances entre tests

### Tests significatifs
- Tester les cas limites et les cas d'erreur
- Nommer les tests de manière descriptive
- Mettre l'accent sur les comportements, pas sur l'implémentation

## Rapport de couverture
Pour générer un rapport de couverture:
```bash
npm run test:coverage
# ou
yarn test:coverage
```

Le rapport est généré dans le dossier `/coverage` et comprend:
- Résumé textuel dans le terminal
- Rapport HTML détaillé
- Rapport JSON pour intégration CI/CD

## Conseils pour augmenter la couverture
1. Commencer par tester les chemins de code critiques
2. Identifier les branches conditionnelles non testées
3. Ajouter des tests pour les gestionnaires d'erreurs
4. Utiliser les mocks pour simuler différents scénarios
