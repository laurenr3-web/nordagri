
# Guide de Contribution

## Introduction
Bienvenue dans le guide de contribution d'OptiField ! Ce document explique comment contribuer efficacement au projet en tant que collaborateur externe.

## Prérequis
- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- Accès à [Supabase](https://supabase.com/) (pour le développement local)

## Installation
1. Forker le repository
2. Cloner votre fork localement
   ```bash
   git clone https://github.com/votre-username/optifield.git
   cd optifield
   ```
3. Installer les dépendances
   ```bash
   npm install
   # ou
   yarn install
   ```

4. Copier le fichier d'environnement exemple
   ```bash
   cp .env.example .env.development
   ```

5. Configurer les variables d'environnement dans `.env.development`

## Structure du projet
Consultez le document `component_tree.md` pour une vue d'ensemble de la structure du projet.

## Workflow de développement
1. Créer une nouvelle branche pour votre fonctionnalité
   ```bash
   git checkout -b feature/nom-de-votre-fonctionnalite
   ```

2. Développer votre fonctionnalité en suivant les standards de code

3. Tester votre code
   ```bash
   npm run test
   # ou
   yarn test
   ```

4. Vérifier la couverture de tests
   ```bash
   npm run test:coverage
   # ou
   yarn test:coverage
   ```

5. Commiter vos changements avec un message descriptif
   ```bash
   git commit -m "feat: description de votre fonctionnalité"
   ```

6. Pousser les changements sur votre fork
   ```bash
   git push origin feature/nom-de-votre-fonctionnalite
   ```

7. Créer une Pull Request vers le repository principal

## Standards de code
- **TypeScript**: Utiliser des types stricts
- **ESLint**: Suivre la configuration ESLint du projet
- **Tests**: Assurer une couverture minimale de 80%
- **Composants**: Créer des composants petits et réutilisables
- **État**: Utiliser les hooks React et React Query
- **CSS**: Utiliser Tailwind CSS, éviter le CSS personnalisé

## Conventions de nommage
- **Composants**: PascalCase (ex: `EquipmentList.tsx`)
- **Hooks**: camelCase avec préfixe "use" (ex: `useEquipmentData.ts`)
- **Services**: camelCase (ex: `equipmentService.ts`)
- **Dossiers**: kebab-case (ex: `time-tracking`)
- **Variables**: camelCase et noms descriptifs

## Commits
Suivre la convention de commits [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` pour les nouvelles fonctionnalités
- `fix:` pour les corrections de bugs
- `docs:` pour la documentation
- `test:` pour l'ajout ou la modification de tests
- `refactor:` pour les modifications de code sans changement fonctionnel
- `style:` pour les changements de style (formatage, espaces, etc.)
- `chore:` pour les tâches de maintenance

## Documentation
- Documenter les nouvelles fonctionnalités
- Mettre à jour la documentation existante si nécessaire
- Commenter le code complexe

## Soumettre une Pull Request
1. Assurez-vous que les tests passent
2. Assurez-vous que le code est conforme aux standards
3. Créez une PR avec une description claire de vos changements
4. Référencez les issues connexes

## Aide et contact
Si vous avez des questions ou besoin d'aide, contactez l'équipe via:
- GitHub Issues
- Email de l'équipe de développement
