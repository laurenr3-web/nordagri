
import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => (
  <footer className="w-full border-t bg-muted text-xs py-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-muted-foreground">
    <span className="">&copy; {new Date().getFullYear()} AgriERP. Tous droits réservés.</span>
    <span className="mx-2 hidden sm:inline">|</span>
    <Link to="/legal" className="underline hover:text-primary transition">
      Mentions légales &amp; Confidentialité
    </Link>
    <span className="mx-2 hidden sm:inline">|</span>
    <Link to="/pricing" className="underline hover:text-primary transition">
      Tarifs
    </Link>
  </footer>
);

export default Footer;
