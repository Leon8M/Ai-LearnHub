import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import MainSidebar from './_components/MainSidebar'
import MainHeader from './_components/MainHeader'

function WorkspaceProvider({ children }) {
  return (
    <SidebarProvider>
        <MainSidebar />

      <div className="w-full">
        <MainHeader />
        <div className='p-8'>
            
        {children}
        </div>
      </div>
    </SidebarProvider>
  )
}

export default WorkspaceProvider