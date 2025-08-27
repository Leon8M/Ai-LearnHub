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
  Sparkles,
  HelpCircle,
  Settings2Icon,
  BookCheck,
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
  { title: 'Get Tokens', icon: UserCircle2Icon, path: '/workspace/buy-tokens' },
  { title: 'Help & Info', icon: HelpCircle, path: '/workspace/help-and-info' },
  { title: 'Settings', icon: Settings2Icon, path: '/workspace/settings' },
];

function MainSidebar() {
  const path = usePathname();

  return (
    <Sidebar className="bg-[var(--background)] border-r border-[var(--border)] shadow-md">
      <SidebarHeader className="p-4 border-b border-[var(--border)]">
        <AddCourseDialog>
          <Button className="btn-primary w-full !text-base !h-12 !px-4 gap-2">
            <Sparkles className="w-5 h-5" />
            Create New Course
          </Button>
        </AddCourseDialog>
      </SidebarHeader>

      <SidebarContent className="flex-grow py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SideOptions.map((option, index) => {
                const active = path === option.path || (option.path !== '/workspace' && path.startsWith(option.path));
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={option.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-[16px] 
                          ${active
                            ? 'bg-[var(--accent)] text-[var(--primary)] font-semibold shadow-sm' // Active state
                            : 'text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)]' // Inactive state
                          }`}
                      >
                        <option.icon className={`w-5 h-5 ${active ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)] group-hover:text-[var(--primary)]'}`} />
                        <span>{option.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem className="mt-6"> {/* Added margin to separate AdSlot */}
                <AdSlot 
                  adClient={process.env.NEXT_PUBLIC_ADSENSE_ID}
                  adSlot="5563136021"
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 text-center text-sm text-[var(--muted-foreground)] border-t border-[var(--border)]">
        © {new Date().getFullYear()} Kamusi.
      </SidebarFooter>
    </Sidebar>
  );
}

export default MainSidebar;
