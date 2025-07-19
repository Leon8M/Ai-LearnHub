"use client";
import { SelectedChapterIndexContext } from '@/context/SelectedChapterIndexContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import React, { use, useState } from 'react'
import { useEffect } from 'react';

export function Provider({ children }) {

  const {user} = useUser();
  const [userDetail, setUserDetail] = useState();
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);


  // This effect runs when the user changes, creating a new user in the database
  useEffect(() => {
    user && CreateNewUser();
  }, [user]);

  // Function to create a new user in the database
  const CreateNewUser = async() => {
    const result = await axios.post('/api/user', {
      email: user?.primaryEmailAddress?.emailAddress,
      name: user?.fullName
    });
    console.log("User created:", result.data);
    setUserDetail(result.data);
  }
  return (
    
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <SelectedChapterIndexContext.Provider value={{ selectedChapterIndex, setSelectedChapterIndex }}>
        <div>
          {/* This is where you can add global providers, context, or state management */}
          {children}
        </div>
      </SelectedChapterIndexContext.Provider>
    </UserDetailContext.Provider>
  )
}
