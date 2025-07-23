'use client';
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Book,
  Compass,
  LayoutDashboard,
  PencilRulerIcon,
  UserCircle2Icon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AddCourseDialog from './AddCourseDialog';
import AdSlot from '@/components/ui/AdSlot';

const SideOptions = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/workspace' },
  { title: 'Learning', icon: Book, path: '/workspace/learning' },
  { title: 'Explore Courses', icon: Compass, path: '/workspace/explore' },
  { title: 'How it works', icon: PencilRulerIcon, path: '/workspace/how-it-works' },
  { title: 'Profile', icon: UserCircle2Icon, path: '/workspace/profile' },
  { title: 'Buy Tokens', icon: UserCircle2Icon, path: '/workspace/buy-tokens' },
];

function MainSidebar() {
  const path = usePathname();

  return (
    <Sidebar className="bg-white border-r shadow-sm">
      <SidebarHeader className="p-4">
        <AddCourseDialog>
          <Button className="w-full text-[15px]">Create New Course</Button>
        </AddCourseDialog>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SideOptions.map((option, index) => {
                const active = path.includes(option.path);
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={option.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 text-[16px] ${
                          active
                            ? 'bg-gray-100 text-primary font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <option.icon className="w-5 h-5" />
                        <span>{option.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem>
                <AdSlot 
                  adClient={process.env.NEXT_PUBLIC_ADSENSE_ID}
                  adSlot="5563136021"
                    />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} AI LearnHub
      </SidebarFooter>
    </Sidebar>
  );
}

export default MainSidebar;
