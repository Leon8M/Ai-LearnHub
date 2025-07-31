'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

function MainHeader({ hideSide = false, courseId }) {
  const [tokens, setTokens] = useState(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch("/api/user/tokens");
        const data = await res.json();
        if (res.ok && data.tokens !== undefined) {
          setTokens(data.tokens);
        } else {
          console.error("Token fetch failed:", data);
        }
      } catch (err) {
        console.error("Failed to fetch tokens", err);
      }
    };

    fetchTokens();
  }, []);

  return (
    <header className="sticky top-0 z-50 px-4 py-3 bg-background/90 backdrop-blur border-b border-border shadow-sm transition-all">
      <div className="flex items-center justify-between w-full max-w-screen-xl mx-auto">
        {/* Left side */}
        <div className="flex items-center gap-4 min-w-0">
          {!hideSide && <SidebarTrigger />}
          <Link href="/workspace" className="flex items-center">
            <div className="relative h-12 md:h-16 w-auto">
              <Image
                src="/logo-main.png"
                alt="Kamusi AI Logo"
                height={64}
                width={160}
                className="h-full w-auto object-contain transition-transform duration-300 hover:scale-105 drop-shadow-[0_0_20px_oklch(var(--secondary)_/_0.35)]"
              />
              {/* Optional: add subtle aura glow behind logo */}
              <div className="absolute inset-0 blur-[50px] rounded-full bg-[oklch(0.65_0.2_280/_0.15)] -z-10" />
            </div>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {tokens !== null && (
            <span className="text-sm text-muted-foreground px-3 py-1 rounded-full border border-border bg-muted shadow-sm whitespace-nowrap">
              💰 {tokens} token{tokens === 1 ? '' : 's'}
            </span>
          )}

          {courseId && (
            <Link href={`/workspace/view-course/${courseId}`}>
              <Button variant="outline" size="sm">Back to Course</Button>
            </Link>
          )}

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}

export default MainHeader;
