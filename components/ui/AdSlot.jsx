'use client';
import { useEffect } from 'react';

export default function AdSlot({ adClient, adSlot, adFormat='auto', className='' }) {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
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
