"use client";
import { SelectedChapterIndexContext } from '@/context/SelectedChapterIndexContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react'; // Added useRef

export function Provider({ children }) {
  const { user, isLoaded, isSignedIn } = useUser(); // Destructure isLoaded and isSignedIn
  const [userDetail, setUserDetail] = useState(null); // Initialize as null for clarity
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);

  // Use a ref to track if a sync attempt has already been made for the current user's session.
  // This is crucial to prevent multiple API calls on subsequent renders or rapid user object updates.
  const hasAttemptedSyncForSession = useRef(false);

  // This effect runs when the Clerk user object, its loaded status, or signed-in status changes.
  useEffect(() => {
    // 1. If user signs out or is not signed in, reset the sync flag.
    // This allows a fresh sync to occur on the next sign-in.
    if (!isSignedIn) {
      hasAttemptedSyncForSession.current = false;
      setUserDetail(null); // Clear userDetail on sign out
      // console.log("Provider: User signed out or not signed in. Resetting sync flag.");
      return; // Exit if no user is signed in
    }

    // 2. Only proceed if Clerk is fully loaded, user object exists,
    // AND we haven't attempted a successful sync for this user session yet.
    if (isLoaded && user && !hasAttemptedSyncForSession.current) {
      // Safely extract required user data from the Clerk user object.
      // Use optional chaining and nullish coalescing to avoid errors if properties are missing.
      const clerkId = user.id;
      const email = user.primaryEmailAddress?.emailAddress;
      const fullName = user.fullName || user.username; // Use username as fallback if fullName is null

      // CRUCIAL CHECK: Ensure ALL required user data is definitively present and valid.
      // This eliminates "Missing required user data" errors from the API.
      const hasRequiredUserData =
        clerkId &&
        email && email.trim() !== '' && // Ensure email is a non-empty string
        fullName && fullName.trim() !== ''; // Ensure fullName is a non-empty string

      if (hasRequiredUserData) {
        // Log that we're about to attempt sync (useful for debugging timing issues).
        console.log("Provider: User data ready. Initiating sync attempt for:", { clerkId, email, fullName });

        // Mark that a sync attempt has been made for this session immediately.
        // This prevents immediate re-runs of this effect from triggering more API calls.
        hasAttemptedSyncForSession.current = true;

        // Introduce a small debounce delay to allow Clerk's user object to fully settle.
        // This helps mitigate subtle race conditions where properties might be briefly undefined.
        const debounceTime = 150; // milliseconds - adjust if needed based on testing
        const timer = setTimeout(() => {
          // Call the async function to perform the actual sync
          syncUserToDatabase(clerkId, email, fullName);
        }, debounceTime);

        // Cleanup function for useEffect: clear the timer if component unmounts or dependencies change.
        return () => clearTimeout(timer);
      } else {
        // If data isn't fully populated yet, log a warning and let the effect re-run
        // when user object dependencies update (Clerk will eventually provide full data).
        console.warn("Provider: Clerk user data still incomplete, waiting for full population...", {
          clerkId: clerkId,
          fullName: fullName,
          email: email,
        });
      }
    }
    // Effect dependencies: Re-run this effect if user, isLoaded, or isSignedIn changes.
  }, [user, isLoaded, isSignedIn]);

  // Function to perform the actual user synchronization with the backend API.
  // It receives all necessary data as arguments.
  const syncUserToDatabase = async (clerkId, email, fullName) => {
    try {
      // Send the data in the format your /api/user backend route expects.
      const result = await axios.post('/api/user', {
        id: clerkId,         // Maps to 'id: clerkId' destructuring on backend
        fullName: fullName,  // Maps to 'fullName' destructuring on backend
        emailAddresses: [{ emailAddress: email }], // Maps to 'emailAddresses' destructuring on backend
      });
      console.log("Provider: User sync successful, received:", result.data);
      setUserDetail(result.data.user); // Assuming your API returns { success: true, user: {...} }
    } catch (error) {
      console.error("Provider: Error syncing user:", error.response?.data || error.message);
      // IMPORTANT: Reset hasAttemptedSyncForSession.current to false on error.
      // This allows the effect to retry syncing if the error was transient (e.g., network issue, or first few 400s).
      // If it's a persistent error (like a 409 Conflict), the API route's 409 response
      // will prevent further inserts, but retrying here is safer for general errors.
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
