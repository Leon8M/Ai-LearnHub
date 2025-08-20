'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

function MainHeader({ hideSide = false, courseId }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [tokens, setTokens] = useState(null);

  useEffect(() => {
    const fetchTokens = async () => {
      if (!isLoaded) {
        setTokens(null);
        return;
      }

      if (!isSignedIn) {
        setTokens(0);
        return;
      }

      try {
        const res = await fetch("/api/user/tokens");
        const data = await res.json(); 
                                       

        if (res.ok && data.tokens !== undefined) {
          setTokens(data.tokens);
        } else {
          //console.error("MainHeader: Token fetch failed from API:", data);
          setTokens(0);
        }
      } catch (err) {
        //console.error("MainHeader: Failed to fetch tokens (network/parse error):", err);
        setTokens(0);
      }
    };

    fetchTokens();

    let intervalId;
    if (isLoaded && isSignedIn) {
      intervalId = setInterval(() => {
        fetchTokens();
      }, 1000); 
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user, isLoaded, isSignedIn]);

  return (
    <header className="sticky top-0 z-50 px-4 py-3 bg-background/90 backdrop-blur border-b border-border shadow-sm transition-all">
      <div className="flex items-center justify-between w-full max-w-screen-xl mx-auto">
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
              <div className="absolute inset-0 blur-[50px] rounded-full bg-[oklch(0.65_0.2_280/_0.15)] -z-10" />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">

          {!isLoaded || tokens === null ? (
            <span className="text-sm text-muted-foreground px-3 py-1 rounded-full border border-border bg-muted shadow-sm whitespace-nowrap flex items-center gap-1">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" /> Loading...
            </span>
          ) : (
            isSignedIn ? (
              <span className="text-sm text-muted-foreground px-3 py-1 rounded-full border border-border bg-muted shadow-sm whitespace-nowrap">
                💰 {tokens} token{tokens === 1 ? '' : 's'}
              </span>
            ) : (
              <Link href="/sign-in" passHref>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  Sign In
                </Button>
              </Link>
            )
          )}

          {courseId && (
            <Link href={`/workspace/view-course/${courseId}`} passHref>
              <Button variant="outline" size="sm">Back to Course</Button>
            </Link>
          )}

          {/* UserButton will automatically handle visibility based on authentication status */}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}

export default MainHeader;
