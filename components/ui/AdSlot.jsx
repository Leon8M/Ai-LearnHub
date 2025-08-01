'use client';
import { useEffect } from 'react';
// Removed toast import as AdSlot no longer directly shows success toasts for tokens
// Removed fetch import as AdSlot no longer directly calls the API

export default function AdSlot({ adClient, adSlot, adFormat = 'auto', className = '', onAdWatched }) {
  useEffect(() => {
    // Push ad for Google AdSense
    (window.adsbygoogle = window.adsbygoogle || []).push({});

    // Simulate ad being "watched" after a delay
    // This is a placeholder for actual ad viewability detection
    const timer = setTimeout(() => {
      if (onAdWatched) {
        onAdWatched(); // Call the callback provided by the parent
      }
    }, 5000); // Wait 5 seconds to count as "watched"

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, [onAdWatched]); // Dependency array includes onAdWatched to ensure effect re-runs if callback changes (though it should be stable)

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block', width: '100%', height: '100%' }} // Ensure it fills its container
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  );
}
