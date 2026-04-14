'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Factory,
  Video,
  Upload,
  Sparkles,
  Plus,
  Play,
  Settings,
  TrendingUp,
  ExternalLink,
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

export default function ContentFactoryPage() {
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

  const platforms = [
    { name: 'YouTube Shorts', icon: '🎬', color: 'bg-red-500' },
    { name: 'TikTok', icon: '🎵', color: 'bg-black' },
    { name: 'Instagram Reels', icon: '📸', color: 'bg-pink-500' },
    { name: 'Pinterest', icon: '📌', color: 'bg-red-600' },
    { name: 'Rutube', icon: '🎥', color: 'bg-blue-500' },
  ];

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
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Контент-Завод</h1>
            <div className='flex gap-2'>
              <button onClick={() => router.push('/app/factory/new')} className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#8B9A46] text-white hover:bg-[#7a8a3d] cursor-pointer transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" />
                <span>Создать</span>
              </button>
              <button onClick={() => router.push('/app/platforms')} className="flex items-center gap-1 px-3 py-1 rounded-md bg-white text-black border hover:bg-gray-50 cursor-pointer transition-colors text-sm font-medium">
                <Bolt className="w-4 h-4" />
                <span>Площадки ({connectedPlatforms.length})</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            
            <div className='border rounded-xl p-4'>
              <CardDescription>Всего проектов</CardDescription>
              <CardTitle className="text-3xl">{projects.length}</CardTitle>
            </div>
            <div className='border rounded-xl p-4'>
              <CardDescription>В генерации</CardDescription>
              <CardTitle className="text-3xl ">
                {projects.filter(p => p.status === 'generating').length}
              </CardTitle>
            </div>
            <div className='border rounded-xl p-4'>
              <CardDescription>Готово к постингу</CardDescription>
              <CardTitle className="text-3xl ">
                {projects.filter(p => p.status === 'ready').length}
              </CardTitle>
            </div>
            <div className='border rounded-xl p-4'>
              <CardDescription>Опубликовано</CardDescription>
              <CardTitle className="text-3xl">
                {projects.filter(p => p.status === 'posted').length}
              </CardTitle>
            </div>
          </div>

          {/* Platforms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Поддерживаемые площадки
              </CardTitle>
              <CardDescription>
                Интеграция с n8n для автоматического постинга
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {platforms.map((platform) => (
                  <div
                    key={platform.name}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full ${platform.color} flex items-center justify-center text-2xl`}>
                      {platform.icon}
                    </div>
                    <span className="text-sm font-medium">{platform.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Мои проекты</h2>
            
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
                    <Button onClick={() => router.push('/app/factory/new')} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Создать проект
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Card key={project._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{project.name}</span>
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
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Upload className="w-4 h-4" />
                          <span>{project.referenceCount} референсов</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          <span>{project.contentCount} видео</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 gap-2"
                          onClick={() => router.push(`/app/factory/${project._id}`)}
                        >
                          <Settings className="w-4 h-4" />
                          Настроить
                        </Button>
                        {project.status === 'ready' && (
                          <Button size="sm" variant="secondary" className="gap-2">
                            <Play className="w-4 h-4" />
                            Постить
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Sparkles className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Как это работает?</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-start gap-2">
                      <span className="font-bold text-primary">1.</span>
                      <span>Загрузите 10-30 референсных видео, передающих ваш стиль</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-bold text-primary">2.</span>
                      <span>AI анализирует стиль и создает профиль бренда</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-bold text-primary">3.</span>
                      <span>Опишите тему или загрузите ТЗ для генерации</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-bold text-primary">4.</span>
                      <span>AI генерирует изображения, видео и аудио</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-bold text-primary">5.</span>
                      <span>Контент автоматически публикуется на все площадки через n8n</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
