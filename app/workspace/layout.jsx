import React from 'react';
import Script from 'next/script';
import WorkspaceProvider from './provider';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-2511222876461022';

function WorkspaceLayout({ children }) {
  return (
    <div>
      {/* Ads live in the signed-in workspace only, so the landing page and public course pages
          stay fast. Loaded once (it used to be included three times on every page). */}
      <Script
        id="adsense"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </div>
  );
}

export default WorkspaceLayout;
