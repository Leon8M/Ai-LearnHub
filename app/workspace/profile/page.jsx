'use client';
import { UserProfile } from '@clerk/nextjs';
import React from 'react';

function Profile() {
  return (
    <div className="p-4 md:p-6 bg-[var(--background)] min-h-screen">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md p-4 sm:p-6 md:p-8 w-full md:max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-[var(--foreground)] mb-6 text-center">
          Manage Your Profile
        </h2>
        <UserProfile routing="hash" />
      </div>
    </div>
  );
}

export default Profile;
