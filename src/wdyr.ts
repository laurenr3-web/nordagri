
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
        /^Maintenance/, // Exclude Maintenance component and children
        /^MaintenanceContent/,
        /^MaintenanceHeader/,
        /^MaintenanceStats/,
        /^NewTaskDialog/,
        /^TaskCard/,
        /^TaskTabs/,
        /^TaskDetails/,
        /^ProtectedRoute/,
        /^RealtimeCacheProvider/,
        /^SafeDialog/
      ],
      trackExtraHooks: []
    });
  });
}
