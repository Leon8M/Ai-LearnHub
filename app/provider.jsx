"use client";
import { SelectedChapterIndexContext } from '@/context/SelectedChapterIndexContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';

export function Provider({ children }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [userDetail, setUserDetail] = useState(null); 
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);

  const hasAttemptedSyncForSession = useRef(false);

  useEffect(() => {
    if (!isSignedIn) {
      hasAttemptedSyncForSession.current = false;
      setUserDetail(null); 
      return;
    }

    if (isLoaded && user && !hasAttemptedSyncForSession.current) {
      // The server reads identity from the Clerk session; nothing is sent in the body. (Users with
      // no full name, e.g. email-only sign-ups, used to be skipped here and never got a row.)
      hasAttemptedSyncForSession.current = true;
      syncUserToDatabase();
    }
  }, [user, isLoaded, isSignedIn]);

  const syncUserToDatabase = async () => {
    try {
      const result = await axios.post('/api/user');
      setUserDetail(result.data.user);
    } catch (error) {
      console.error('User sync failed:', error.response?.data?.error || error.message);
      hasAttemptedSyncForSession.current = false;
    }
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <SelectedChapterIndexContext.Provider value={{ selectedChapterIndex, setSelectedChapterIndex }}>
        <div>
          {/* This is where you can add global providers, context, or state management */}
          {/* The user sync logic is now safely contained within this Provider */}
          {children}
        </div>
      </SelectedChapterIndexContext.Provider>
    </UserDetailContext.Provider>
  );
}
