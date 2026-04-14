"use client"

import * as React from "react"
import {
  Command,
  LifeBuoy,
  LogOut,
  MonitorPlay,
  Folder,
  Zap,
  Home,
  User,
  BookOpen,
  History,
  Factory,
  FolderArchive,
  FolderClock,
} from "lucide-react"

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onLogout: () => void;
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Главная",
      url: "/app",
      icon: Home,
    },
    {
      title: "Мой профиль",
      url: "/profile",
      icon: User,
    },
    {
      title: "Сгенерировать",
      url: "#",
      icon: Zap,
      items: [
        {
          title: "Создать изображение",
          url: "/app/image/new",
        },
        {
          title: "Создать видео",
          url: "/app/video/new",
        },
        {
          title: "Наложить аудио",
          url: "/app/audio/new",
        },
        {
          title: "Работа с текстом",
          url: "/app/text/new",
        },
      ],
    },
    {
      title: "Медиатека",
      url: "#",
      icon: Folder,
    },
    {
      title: "Контент-Завод",
      url: "/app/factory",
      icon: Factory,
    },
    {
      title: "Площадки",
      url: "/app/platforms",
      icon: MonitorPlay,
    },
  ],
  
  navSecondary: [
    {
      title: "Справочный центр",
      url: "#",
      icon: BookOpen,
    },
  ],
}

export function AppSidebar({ user, onLogout, ...props }: AppSidebarProps) {
  const userData = {
    name: user.name,
    email: user.email,
    avatar: "/avatars/shadcn.jpg",
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Auto Posting</span>
                  {/* <span className="truncate text-xs">by IX.STUDIO</span> */}
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <div>
          <NavUser user={userData} />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
