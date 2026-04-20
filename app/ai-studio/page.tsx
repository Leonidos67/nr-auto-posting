'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Factory,
  Plus,
  Bolt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentProject {
  _id: string;
  name: string;
  description: string;
  status: 'draft' | 'generating' | 'ready' | 'posted';
  referenceCount: number;
  contentCount: number;
  platforms: string[];
  createdAt: string;
  updatedAt: string;
}

interface ConnectedPlatform {
  id: string;
  platform: string;
  accountName: string;
  status: string;
}

export default function AIStudioPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchConnectedPlatforms();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/factory/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchConnectedPlatforms = async () => {
    try {
      const response = await fetch('/api/platforms');
      if (response.ok) {
        const data = await response.json();
        setConnectedPlatforms(data.platforms || []);
      }
    } catch (error) {
      console.error('Error fetching platforms:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm">секундочку...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={handleLogout} />
      <SidebarInset className="overflow-x-hidden">
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">AI-Студия — Мои проекты</h2>
              <div className='flex gap-2'>
                <button onClick={() => router.push('/ai-studio/new')} className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#8B9A46] text-white hover:bg-[#7a8a3d] transition-colors text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  <span>Создать</span>
                </button>
                <button onClick={() => router.push('/app/platforms')} className="flex items-center gap-1 px-3 py-1 rounded-md bg-white text-black border hover:bg-gray-50 transition-colors text-sm font-medium">
                  <Bolt className="w-4 h-4" />
                  <span>Площадки ({connectedPlatforms.length})</span>
                </button>
              </div>
            </div>
            
            {loadingProjects ? (
              <div className="text-center py-12 text-muted-foreground">
                Загрузка проектов...
              </div>
            ) : projects.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Factory className="w-16 h-16 text-muted-foreground/50" />
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">Нет проектов</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Создайте первый проект для автоматической генерации контента
                    </p>
                    <Button onClick={() => router.push('/ai-studio/new')} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Создать проект
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {projects.map((project) => (
                  <Card key={project._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{project.name}</span>
                        <div className="flex items-center gap-2">
                          {project.status === 'ready' && (
                            <span className="text-green-500 text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900">
                              Готов
                            </span>
                          )}
                          {project.status === 'generating' && (
                            <span className="text-yellow-500 text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900">
                              Генерация
                            </span>
                          )}
                        </div>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 gap-2"
                          onClick={() => router.push(`/ai-studio/${project._id}`)}
                        >
                          Открыть проект
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
