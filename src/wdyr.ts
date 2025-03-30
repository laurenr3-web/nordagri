
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  // Import dynamically instead of using require
  import('@welldone-software/why-did-you-render').then((whyDidYouRender) => {
    whyDidYouRender.default(React, {
      trackAllPureComponents: true,
      // Exclude problematic hooks from React Router 
      exclude: [/^BrowserRouter/, /^Router/, /^Routes/, /^Route/, /Navigate$/],
      // Only track hooks with explicit whyDidYouRender = true property
      trackExtraHooks: [
        [React, 'useState'],
        [React, 'useReducer'],
        [React, 'useContext'],
      ]
    });
  });
}
