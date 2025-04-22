
import React from "react";

const LegalMentions: React.FC = () => (
  <div className="prose max-w-none">
    <h2>Mentions légales</h2>
    <ul>
      <li><strong>Nom entreprise</strong> : AgriERP Demo SARL</li>
      <li><strong>SIRET</strong> : 123 456 789 00010</li>
      <li><strong>Contact</strong> : contact@agri-erp.fr</li>
      <li><strong>Adresse</strong> : 1 rue de la Ferme, 75000 Paris, France</li>
    </ul>
    <p>Responsable de la publication : Jean Dupont</p>
    <p>Hébergeur : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
  </div>
);

export default LegalMentions;
