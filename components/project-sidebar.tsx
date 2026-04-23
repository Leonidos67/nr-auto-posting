"use client"

import * as React from "react"
import { useParams, useRouter, usePathname } from "next/navigation"
import { 
  Factory, 
  LayoutDashboard, 
  Upload, 
  FileText, 
  Send,
  ArrowLeft,
  ChevronsUpDown,
  Search,
  X,
  Plus,
  Edit2,
  Check,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from "react"

interface ProjectSidebarProps extends React.ComponentProps<typeof Sidebar> {
  project: {
    _id: string;
    name: string;
    description?: string;
  } | null;
  allProjects: Array<{
    _id: string;
    name: string;
    description?: string;
  }>;
  onProjectSelect: (projectId: string) => void;
  onProjectNameUpdate?: (newName: string) => void;
}

const navItems = [
  {
    id: 'overview',
    title: 'Обзор',
    icon: LayoutDashboard,
    route: '/ai-studio/[projectId]',
  },
  {
    id: 'references',
    title: 'Референсы',
    icon: Upload,
    route: '/ai-studio/[projectId]/upload',
  },
  {
    id: 'brief',
    title: 'Создание ТЗ',
    icon: FileText,
    route: '/ai-studio/[projectId]/generate',
  },
  {
    id: 'publish',
    title: 'Публикация',
    icon: Send,
    route: '/ai-studio/[projectId]/publish',
  },
]

export function ProjectSidebar({ 
  project, 
  allProjects, 
  onProjectSelect,
  onProjectNameUpdate,
  ...props 
}: ProjectSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const projectId = params?.projectId as string
  
  const [projectSearch, setProjectSearch] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(project?.name || '')

  useEffect(() => {
    setEditName(project?.name || '')
  }, [project?.name])

  const getActiveTab = () => {
    if (pathname === `/ai-studio/${projectId}` || pathname === `/ai-studio/${projectId}/`) {
      return 'overview'
    }
    if (pathname === `/ai-studio/${projectId}/upload`) {
      return 'references'
    }
    if (pathname === `/ai-studio/${projectId}/generate`) {
      return 'brief'
    }
    if (pathname === `/ai-studio/${projectId}/publish`) {
      return 'publish'
    }
    return 'overview'
  }

  const activeTab = getActiveTab()

  const handleSaveName = () => {
    if (editName.trim() && onProjectNameUpdate) {
      onProjectNameUpdate(editName.trim())
    }
    setIsEditing(false)
  }

  const filteredProjects = allProjects.filter(p => 
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(projectSearch.toLowerCase()))
  )

  return (
    <>
      {/* Full-height border line */}
      <div className="fixed left-64 top-0 bottom-0 w-px border-r z-50 pointer-events-none" />
      
      <Sidebar 
        variant="sidebar" 
        collapsible="none"
        className="border-r-0 w-64 h-screen"
        {...props}
      >
      <SidebarHeader className="border-b pb-3">
        <div className="space-y-3">

          {/* Project Name with Dropdown */}
          <div className="space-y-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') {
                      setIsEditing(false)
                      setEditName(project?.name || '')
                    }
                  }}
                  className="h-7 text-sm"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={handleSaveName}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div 
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#8B9A46] flex items-center justify-center flex-shrink-0">
                      <Factory className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-sm font-semibold truncate flex-1">
                      {project?.name || 'загружаем...'}
                    </h2>
                    <ChevronsUpDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60">
                  {/* Search Input */}
                  <div className="relative p-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Поиск проектов..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                    {projectSearch && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setProjectSearch('')
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  {/* Projects List */}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredProjects.map((p) => (
                      <DropdownMenuItem
                        key={p._id}
                        onClick={() => onProjectSelect(p._id)}
                        className={`flex items-start gap-2 p-2.5 cursor-pointer ${
                          p._id === projectId ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#8B9A46]/20 flex items-center justify-center flex-shrink-0">
                          <Factory className="w-3.5 h-3.5 text-[#8B9A46]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {p.description || 'Нет описания'}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    
                    {filteredProjects.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-xs">
                        Проекты не найдены
                      </div>
                    )}
                  </div>

                  {/* Create Project Button */}
                  <div className="border-t p-1">
                    <button
                      onClick={() => router.push('/ai-studio/new')}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium hover:bg-muted transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Создать проект
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {project?.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 flex-1">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            const Icon = item.icon
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`w-full justify-start gap-3 ${
                    isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <button
                    onClick={() => {
                      const route = item.route.replace('[projectId]', projectId)
                      router.push(route)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{item.title}</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
    </>
  )
}
