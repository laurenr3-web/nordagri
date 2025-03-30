
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  // Import dynamically instead of using require
  import('@welldone-software/why-did-you-render').then((whyDidYouRender) => {
    whyDidYouRender.default(React, {
      // Reduce component tracking to only components that have 
      // whyDidYouRender = true flag to avoid performance issues
      trackAllPureComponents: false,
      
      // Exclude problematic React Router components to prevent hook errors
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
        /Sidebar$/
      ],
      
      // Only track hooks with explicit whyDidYouRender = true property
      trackExtraHooks: []
    });
  });
}
