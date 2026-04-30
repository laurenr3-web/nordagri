import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * Desktop application shell: renders the left sidebar (Navbar) on `lg:`+ screens
 * and a content area for the routed pages. On mobile the sidebar is hidden and
 * the existing `MobileMenu` (bottom bar) takes over.
 *
 * The sidebar is hidden on routes that should remain "chromeless" (auth flow,
 * scan redirects, public legal pages).
 */
const HIDE_SIDEBAR_PREFIXES = [
  '/auth',
  '/accept-invitation',
  '/scan',
  '/legal',
  '/pricing',
  '/unsubscribe',
  '/bento-demo',
];

export const DesktopShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const hideSidebar = HIDE_SIDEBAR_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full">
      <aside
        className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground"
        aria-label="Barre latérale principale"
      >
        <Navbar />
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};

export default DesktopShell;