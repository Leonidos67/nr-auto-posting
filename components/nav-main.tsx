"use client"

import { useState } from "react"
import { Plus, Minus, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname();
  
  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item) => {
          // Check if this item or any of its subitems is active
          const isItemActive = item.url !== '#' && pathname === item.url;
          const hasActiveSubItem = item.items?.some(subItem => pathname === subItem.url);
          const shouldBeActive = isItemActive || hasActiveSubItem;
          const [isOpen, setIsOpen] = useState(shouldBeActive || false);
          
          return (
          <Collapsible key={item.title} asChild open={isOpen} onOpenChange={setIsOpen}>
            <SidebarMenuItem>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} className={`cursor-pointer group ${shouldBeActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}>
                      <item.icon />
                      <span>{item.title}</span>
                      {isOpen ? (
                        <Minus className="ml-auto transition-all duration-200" />
                      ) : (
                        <Plus className="ml-auto transition-all duration-200" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const isSubActive = pathname === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild className={isSubActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                <SidebarMenuButton asChild tooltip={item.title} className={shouldBeActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
