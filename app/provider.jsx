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
      const clerkId = user.id;
      const email = user.primaryEmailAddress?.emailAddress;
      const fullName = user.fullName || user.username;

      const hasRequiredUserData =
        clerkId &&
        email && email.trim() !== '' && 
        fullName && fullName.trim() !== '';

      if (hasRequiredUserData) {
        console.log("Provider: User data ready. Initiating sync attempt for:", { clerkId, email, fullName });

        hasAttemptedSyncForSession.current = true;

        const debounceTime = 150;
        const timer = setTimeout(() => {
          syncUserToDatabase(clerkId, email, fullName);
        }, debounceTime);

        return () => clearTimeout(timer);
      } else {
        console.warn("Provider: Clerk user data still incomplete, waiting for full population...", {
          clerkId: clerkId,
          fullName: fullName,
          email: email,
        });
      }
    }
  }, [user, isLoaded, isSignedIn]);

  const syncUserToDatabase = async (clerkId, email, fullName) => {
    try {
      const result = await axios.post('/api/user', {
        id: clerkId,     
        fullName: fullName, 
        emailAddresses: [{ emailAddress: email }],
      });
      console.log("Provider: User sync successful, received:", result.data);
      setUserDetail(result.data.user); // Assuming your API returns { success: true, user: {...} }
    } catch (error) {
      console.error("Provider: Error syncing user:", error.response?.data || error.message);
      if (axios.isAxiosError(error) && error.response?.status !== 409) {
          hasAttemptedSyncForSession.current = false;
      }
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
