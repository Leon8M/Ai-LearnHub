import { UserProfile } from '@clerk/nextjs'
import React from 'react'

function Profile() {
  return (
    <div>
        <h2 className='text-2xl font-bold mb-4'>Manage Profile</h2>
        <UserProfile />
    </div>
  )
}

export default Profile