'use client';
import { UserProfile } from '@clerk/nextjs';
import React from 'react';

function Profile() {
  return (
    <div className="p-4 md:p-6 bg-[var(--background)] min-h-screen">
      {/* Adjusted padding for better mobile responsiveness */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md p-4 sm:p-6 md:p-8 w-full md:max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-[var(--foreground)] mb-6 text-center">
          Manage Your Profile
        </h2>
        {/*
          IMPORTANT: To fully resolve the Clerk routing error, it is highly recommended
          to rename your file from `app/workspace/profile/page.jsx`
          to `app/workspace/profile/[[...rest]]/page.jsx`.
          
          The `routing="hash"` prop below is a temporary workaround to prevent
          the console error if you cannot change the file structure immediately.
          It makes Clerk handle internal navigation with URL hashes (e.g., #account)
          instead of path segments.
        */}
        <UserProfile routing="hash" />
      </div>
    </div>
  );
}

export default Profile;
