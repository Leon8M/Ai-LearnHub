'use client';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function AdSlot({ adClient, adSlot, adFormat = 'auto', className = '' }) {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});

    const handleView = () => {
      let count = parseInt(localStorage.getItem('watchedAds') || '0');
      count += 1;
      localStorage.setItem('watchedAds', count);

      if (count >= 2) {
        // Show toast and trigger backend token award
        toast.success('You’ve earned 1 free token!');
        fetch('/api/user/watch-ad-token', { method: 'POST' }); // See route below
        localStorage.setItem('watchedAds', '0');
      }
    };

    // Fake delay simulating ad visibility (since actual detection isn't available)
    const timer = setTimeout(handleView, 5000); // Wait 5s to count as "watched"

    return () => clearTimeout(timer);
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  );
}
