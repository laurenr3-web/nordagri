
// This file is intentionally empty - WDYR is temporarily disabled to resolve
// the "Cannot read properties of null (reading 'current')" error.
// To re-enable WDYR, uncomment the code below and adjust the exclusions as needed.

/*
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  import('@welldone-software/why-did-you-render').then((whyDidYouRender) => {
    whyDidYouRender.default(React, {
      trackAllPureComponents: false,
      exclude: [
        /^BrowserRouter/, 
        /^Router/, 
        /^Routes/, 
        /^Route/, 
        /Navigate$/, 
        /^Link$/,
        /^AuthProvider/,
        /^Suspense$/,
        /^ErrorBoundary$/,
        /^SimplifiedSidebarProvider$/,
        /^SidebarProvider$/,
        /Sidebar$/,
        /^TooltipProvider$/,
        /^Dialog/,
        /^Sheet/,
        /^Toaster/,
        /Toast$/,
        /Provider$/,
        /Context$/,
        /^QueryClientProvider/,
        /use/, // Exclude all hooks
        /^Maintenance/, // Exclude Maintenance component
        /^MaintenanceContent/,
        /^MaintenanceHeader/,
        /^NewTaskDialog/,
        /^TaskCard/,
        /^ProtectedRoute/,
        /^RealtimeCacheProvider/
      ],
      trackExtraHooks: []
    });
  });
}
*/
