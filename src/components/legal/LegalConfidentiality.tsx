
import React from "react";

const LegalConfidentiality: React.FC = () => (
  <div className="prose max-w-none">
    <h2>Politique de confidentialité (RGPD)</h2>
    <h3>Finalité des données</h3>
    <p>
      Vos données servent uniquement à la gestion de votre compte et à l’amélioration du service.
    </p>
    <h3>Droit à la suppression</h3>
    <p>
      Vous pouvez demander la suppression de vos données à tout moment en nous contactant à l’adresse indiquée ci-dessus.
    </p>
    <h3>Conservation</h3>
    <p>
      Les données sont conservées 3 ans après la dernière activité par l’utilisateur ou suppression de compte.
    </p>
    <h3>Contact RGPD</h3>
    <p>
      Pour tout sujet relatif à la protection des données : <a href="mailto:contact@agri-erp.fr" className="text-primary underline">contact@agri-erp.fr</a>
    </p>
  </div>
);

export default LegalConfidentiality;
