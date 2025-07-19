import React from 'react'
import Welcome from '../_components/Welcome'
import EnrolledCourseList from '../_components/EnrolledCourseList'

function Learning() {
  return (
    <div>
        <Welcome />
        <h2 className='text-2xl font-bold mb-4 mt-4'>Learning</h2>
        <p className='text-gray-600 mb-4'>Here you monitor your progress in the courses you are enrolled.</p>
        <EnrolledCourseList />
    </div>
  )
}

export default Learning