"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  History,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

interface Dialogue {
  id: string
  title: string
  modelVersion: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

export function NavProjects() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [dialogues, setDialogues] = useState<Dialogue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    const fetchDialogues = async () => {
      try {
        const response = await fetch('/api/dialogues')
        if (response.ok) {
          const data = await response.json()
          setDialogues(data.dialogues || [])
          // Start polling only after successful fetch
          if (!interval) {
            interval = setInterval(fetchDialogues, 30000) // Every 30 seconds instead of 5
          }
        } else {
          console.error('Failed to fetch dialogues:', response.status)
        }
      } catch (error) {
        console.error('Error fetching dialogues:', error)
        // Stop polling on error
        if (interval) {
          clearInterval(interval)
          interval = null
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDialogues()

    // Слушаем событие обновления истории
    const handleRefresh = () => fetchDialogues()
    window.addEventListener('refreshHistory', handleRefresh)

    return () => {
      if (interval) {
        clearInterval(interval)
      }
      window.removeEventListener('refreshHistory', handleRefresh)
    }
  }, [])

  const handleDialogueClick = (dialogueId: string) => {
    router.push(`/app/image/${dialogueId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Сегодня'
    if (days === 1) return 'Вчера'
    if (days < 7) return `${days} дн. назад`
    return date.toLocaleDateString('ru-RU')
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <div className="flex items-center">
        <History className="w-3 h-3 text-muted-foreground" />
        <SidebarGroupLabel>История</SidebarGroupLabel>
      </div>
      <SidebarMenu>
        {loading ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <div className="animate-pulse h-4 w-32 bg-muted rounded"></div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : dialogues.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <span className="text-muted-foreground">Ваши проекты будут отображаться здесь</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          dialogues.map((dialogue) => (
            <SidebarMenuItem key={dialogue.id}>
              <SidebarMenuButton onClick={() => handleDialogueClick(dialogue.id)}>
                <History className="text-muted-foreground" />
                <div className="flex flex-col gap-0.5">
                  <span className="truncate">{dialogue.title}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(dialogue.updatedAt)}</span>
                </div>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem onClick={() => handleDialogueClick(dialogue.id)}>
                    <History className="text-muted-foreground" />
                    <span>Открыть чат</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Trash2 className="text-muted-foreground" />
                    <span>Удалить чат</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
