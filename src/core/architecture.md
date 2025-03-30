
# Architecture du projet

## Principes architecturaux
1. **Séparation des préoccupations** - Chaque module a une responsabilité unique et bien définie
2. **Indépendance des couches** - Les couches inférieures ne dépendent pas des couches supérieures
3. **Isolation de l'API externe** - Les détails de l'API sont isolés dans la couche d'adaptateurs
4. **Modèle de données unifié** - Un seul modèle de données est utilisé dans toute l'application

## Couches architecturales
1. **Couche de présentation** (ui) - Responsable de l'affichage et des interactions utilisateur
2. **Couche métier** (core) - Contient la logique métier et les règles de gestion
3. **Couche de données** (data) - Gère l'accès aux données et l'état de l'application
4. **Couche utilitaire** (utils) - Contient des fonctions génériques réutilisables

## Flux de données
1. L'utilisateur interagit avec les composants UI
2. Les hooks UI appellent les services métier
3. Les services métier utilisent les repositories pour accéder aux données
4. Les repositories utilisent les adaptateurs pour communiquer avec l'API
5. Les adaptateurs transforment les données API en modèles internes
