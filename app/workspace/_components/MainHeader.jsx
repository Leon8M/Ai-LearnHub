'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserButton, useUser } from '@clerk/nextjs'; // Import useUser hook
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react'; // Import Loader2 icon for loading state

function MainHeader({ hideSide = false, courseId }) {
  // Use Clerk's useUser hook to get user status and data
  const { user, isLoaded, isSignedIn } = useUser();
  const [tokens, setTokens] = useState(null); // Initialize as null to indicate loading

  useEffect(() => {
    const fetchTokens = async () => {
      // Step 1: Check Clerk's loading and sign-in status first
      if (!isLoaded) {
        // Clerk is still loading, so we can't determine auth status yet.
        // Keep tokens null to show loading indicator.
        setTokens(null);
        return;
      }

      if (!isSignedIn) {
        // User is not signed in. No need to fetch tokens.
        // Set tokens to 0 and ensure no loading state for logged-out users.
        setTokens(0);
        return;
      }

      // If we reach here, Clerk is loaded AND user is signed in.
      // Now, safely attempt to fetch tokens.
      try {
        const res = await fetch("/api/user/tokens");
        const data = await res.json(); // This will only be attempted if res.status is OK (2xx) or if the API consistently returns JSON on error.
                                       // If it returns HTML (like a 404 page), .json() will throw the SyntaxError.

        if (res.ok && data.tokens !== undefined) {
          // If the response is successful and contains tokens
          setTokens(data.tokens);
        } else {
          // If res.ok is false (e.g., 401 Unauthorized, 404 Not Found JSON)
          // or data.tokens is undefined (API returned something unexpected JSON)
          console.error("MainHeader: Token fetch failed from API:", data);
          setTokens(0); // Default to 0 tokens on any API-reported failure
        }
      } catch (err) {
        // This catch block handles network errors or JSON parsing errors (like the "Unexpected token '<'")
        console.error("MainHeader: Failed to fetch tokens (network/parse error):", err);
        setTokens(0); // Default to 0 tokens on fetch error
      }
    };

    // Initial fetch of tokens when component mounts or user status changes
    fetchTokens();

    let intervalId;
    // Set up interval to fetch tokens every second, ONLY if Clerk is loaded AND the user is signed in.
    if (isLoaded && isSignedIn) {
      intervalId = setInterval(() => {
        fetchTokens();
      }, 1000); // Poll every 1 second
    }

    // Cleanup function: Clear the interval when the component unmounts,
    // or when `isLoaded` or `isSignedIn` changes (e.g., user logs out).
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user, isLoaded, isSignedIn]); // Effect dependencies: Re-run if these Clerk states change

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
          {/* Display tokens or loading/sign-in prompt */}
          {/* If Clerk is still loading or tokens are null, show loading indicator */}
          {!isLoaded || tokens === null ? (
            <span className="text-sm text-muted-foreground px-3 py-1 rounded-full border border-border bg-muted shadow-sm whitespace-nowrap flex items-center gap-1">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" /> Loading...
            </span>
          ) : (
            // If Clerk is loaded and user is signed in, show tokens
            isSignedIn ? (
              <span className="text-sm text-muted-foreground px-3 py-1 rounded-full border border-border bg-muted shadow-sm whitespace-nowrap">
                💰 {tokens} token{tokens === 1 ? '' : 's'}
              </span>
            ) : (
              // If Clerk is loaded but user is not signed in, show a login button
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
