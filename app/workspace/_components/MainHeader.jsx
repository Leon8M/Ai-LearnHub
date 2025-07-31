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
        const res = await fetch('/api/user/tokens');
        const data = await res.json();
        if (data.tokens !== undefined) setTokens(data.tokens);
      } catch (err) {
        console.error("Failed to fetch tokens", err);
      }
    };

    fetchTokens();
  }, []);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {!hideSide && <SidebarTrigger />}
        <Link href="/workspace" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="AI LearnHub Logo" width={36} height={36} />
          <span className="text-lg font-semibold text-gray-800 hover:opacity-80 transition">
            AI LearnHub
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {tokens !== null && (
          <span className="text-sm font-medium text-gray-700 px-3 py-1 bg-gray-100 rounded-full">
            🪙 {tokens} token{tokens !== 1 && 's'}
          </span>
        )}
        {courseId && (
          <Link href={`/workspace/view-course/${courseId}`}>
            <Button variant="outline">Back to Course</Button>
          </Link>
        )}
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}

export default MainHeader;
