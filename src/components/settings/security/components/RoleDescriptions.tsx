
import React from 'react';

export function RoleDescriptions() {
  return (
    <div className="text-sm text-muted-foreground pt-6 border-t mt-6">
      <h4 className="font-medium text-foreground mb-2">Description des rôles</h4>
      <p>
        <strong>Propriétaire :</strong> Créateur de la ferme, accès complet à toutes les fonctionnalités
      </p>
      <p>
        <strong>Administrateur :</strong> Peut gérer les utilisateurs et accéder à tous les paramètres
      </p>
      <p>
        <strong>Éditeur :</strong> Peut gérer les équipements, les tâches et les données
      </p>
      <p>
        <strong>Lecteur :</strong> Peut consulter les données sans pouvoir les modifier
      </p>
    </div>
  );
}
