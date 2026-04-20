'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
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
  Trash2,
  BarChart3,
  FileText,
  Gauge,
  Network,
  Calendar,
  Clock,
  HardDrive,
  CreditCard,
  Globe,
  Key,
  Bell,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import '@/components/FactoryTabs.css';

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

type TabType = 'overview' | 'generations' | 'logs' | 'analytics' | 'speed' | 'platforms' | 'ai-gateway' | 'usage' | 'settings';

export default function ContentFactoryPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [hoveredTab, setHoveredTab] = useState<TabType | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [logFilter, setLogFilter] = useState<'all' | 'generation' | 'upload' | 'publish' | 'error'>('all');
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabElementsRef = useRef<Map<TabType, HTMLButtonElement>>(new Map());

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

  // Update indicator position immediately after render
  useLayoutEffect(() => {
    const updatePosition = () => {
      const tabElement = tabElementsRef.current.get(activeTab);
      const container = tabsRef.current;
      
      if (tabElement && container) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = tabElement.getBoundingClientRect();
        
        setIndicatorStyle({
          left: tabRect.left - containerRect.left,
          width: tabRect.width,
        });
      }
    };

    updatePosition();
  }, [activeTab]);

  // Update indicator for hover effects
  const updateIndicator = (tabId: TabType) => {
    const tabElement = tabElementsRef.current.get(tabId);
    const container = tabsRef.current;
    
    if (tabElement && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = tabElement.getBoundingClientRect();
      
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const tabElement = tabElementsRef.current.get(activeTab);
      const container = tabsRef.current;
      
      if (tabElement && container) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = tabElement.getBoundingClientRect();
        
        setIndicatorStyle({
          left: tabRect.left - containerRect.left,
          width: tabRect.width,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  useEffect(() => {
    if (hoveredTab) {
      updateIndicator(hoveredTab);
    }
  }, [hoveredTab]);

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

  const handleDeleteProject = async (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Вы уверены, что хотите удалить проект "${projectName}"?\n\nЭто действие нельзя отменить. Все данные проекта будут удалены.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/factory/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove project from list
        setProjects(prev => prev.filter(p => p._id !== projectId));
      } else {
        const data = await response.json();
        alert(data.error || 'Ошибка при удалении проекта');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Ошибка при удалении проекта');
    }
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
          {/* Header */}
          {/* <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">AI-Студия</h1>
          </div> */}

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            
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
          </div> */}

          {/* Navigation Tabs */}
          {/* <div className="factory-tabs-container" ref={tabsRef}>
            <div 
              className="tab-indicator"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
              }}
            />
            
            <button
              ref={(el) => {
                if (el) tabElementsRef.current.set('overview', el);
              }}
              onClick={() => setActiveTab('overview')}
              onMouseEnter={() => setHoveredTab('overview')}
              onMouseLeave={() => setHoveredTab(null)}
              className={`factory-tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <Factory className="w-4 h-4" />
              Обзор
            </button>
            <button
              ref={(el) => {
                if (el) tabElementsRef.current.set('generations', el);
              }}
              onClick={() => setActiveTab('generations')}
              onMouseEnter={() => setHoveredTab('generations')}
              onMouseLeave={() => setHoveredTab(null)}
              className={`factory-tab-button ${activeTab === 'generations' ? 'active' : ''}`}
            >
              <Video className="w-4 h-4" />
              Генерации
            </button>
            <button
              ref={(el) => {
                if (el) tabElementsRef.current.set('logs', el);
              }}
              onClick={() => setActiveTab('logs')}
              onMouseEnter={() => setHoveredTab('logs')}
              onMouseLeave={() => setHoveredTab(null)}
              className={`factory-tab-button ${activeTab === 'logs' ? 'active' : ''}`}
            >
              <FileText className="w-4 h-4" />
              Журналы
            </button>
            <button
              ref={(el) => {
                if (el) tabElementsRef.current.set('analytics', el);
              }}
              onClick={() => setActiveTab('analytics')}
              onMouseEnter={() => setHoveredTab('analytics')}
              onMouseLeave={() => setHoveredTab(null)}
              className={`factory-tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <BarChart3 className="w-4 h-4" />
              Аналитика
            </button>
            <button
              ref={(el) => {
                if (el) tabElementsRef.current.set('speed', el);
              }}
              onClick={() => setActiveTab('speed')}
              onMouseEnter={() => setHoveredTab('speed')}
              onMouseLeave={() => setHoveredTab(null)}
              className={`factory-tab-button ${activeTab === 'speed' ? 'active' : ''}`}
            >
              <Gauge className="w-4 h-4" />
              Скорость
            </button>
            <button
              ref={(el) => {
                if (el) tabElementsRef.current.set('platforms', el);
              }}
              onClick={() => setActiveTab('platforms')}
              onMouseEnter={() => setHoveredTab('platforms')}
              onMouseLeave={() => setHoveredTab(null)}
              className={`factory-tab-button ${activeTab === 'platforms' ? 'active' : ''}`}
            >
              <Bolt className="w-4 h-4" />
              Площадки
            </button>
            <button
              ref={(el) => {
                if (el) tabElementsRef.current.set('ai-gateway', el);
              }}
              onClick={() => setActiveTab('ai-gateway')}
              onMouseEnter={() => setHoveredTab('ai-gateway')}
              onMouseLeave={() => setHoveredTab(null)}
              className={`factory-tab-button ${activeTab === 'ai-gateway' ? 'active' : ''}`}
            >
              <Network className="w-4 h-4" />
              Шлюз ИИ
            </button>
            <button
              ref={(el) => {
                if (el) tabElementsRef.current.set('usage', el);
              }}
              onClick={() => setActiveTab('usage')}
              onMouseEnter={() => setHoveredTab('usage')}
              onMouseLeave={() => setHoveredTab(null)}
              className={`factory-tab-button ${activeTab === 'usage' ? 'active' : ''}`}
            >
              <TrendingUp className="w-4 h-4" />
              Использование
            </button>
            <button
              ref={(el) => {
                if (el) tabElementsRef.current.set('settings', el);
              }}
              onClick={() => setActiveTab('settings')}
              onMouseEnter={() => setHoveredTab('settings')}
              onMouseLeave={() => setHoveredTab(null)}
              className={`factory-tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings className="w-4 h-4" />
              Настройки
            </button>
          </div> */}

          {/* Generations Tab Content */}
          {activeTab === 'generations' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Генерации</h2>
              <p className="text-muted-foreground">История всех генераций контента</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-xl p-4">
                <CardDescription className="text-xs">Всего генераций</CardDescription>
                <CardTitle className="text-3xl mt-2">
                  {projects.reduce((sum, p) => sum + p.contentCount, 0)}
                </CardTitle>
                <p className="text-xs text-green-500 mt-1">За все время</p>
              </div>
              <div className="border rounded-xl p-4">
                <CardDescription className="text-xs">В процессе</CardDescription>
                <CardTitle className="text-3xl mt-2">
                  {projects.filter(p => p.status === 'generating').length}
                </CardTitle>
                <p className="text-xs text-yellow-500 mt-1">Генерируется</p>
              </div>
              <div className="border rounded-xl p-4">
                <CardDescription className="text-xs">Готово</CardDescription>
                <CardTitle className="text-3xl mt-2">
                  {projects.filter(p => p.status === 'ready').length}
                </CardTitle>
                <p className="text-xs text-green-500 mt-1">К публикации</p>
              </div>
            </div>

            {/* Generations List */}
            <Card>
              <CardHeader>
                <CardTitle>Последние генерации</CardTitle>
                <CardDescription>История генераций по проектам</CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Нет генераций</p>
                    <p className="text-sm mt-2">Создайте проект и запустите генерацию</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project._id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Video className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{project.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {project.contentCount} видео • {project.referenceCount} референсов
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {project.status === 'ready' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                              Готов
                            </span>
                          )}
                          {project.status === 'generating' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400">
                              Генерация
                            </span>
                          )}
                          {project.status === 'draft' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
                              Черновик
                            </span>
                          )}
                          {project.status === 'posted' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                              Опубликован
                            </span>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/app/factory/${project._id}`)}
                          >
                            Открыть
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          )}

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Мои проекты</h2>
              <div className='flex gap-2'>
                <button onClick={() => router.push('/app/factory/new')} className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#8B9A46] text-white hover:bg-[#7a8a3d] transition-colors text-sm font-medium">
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
                    <Button onClick={() => router.push('/app/factory/new')} className="gap-2">
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
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
          )}

          {activeTab === 'platforms' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Площадки</h2>
                  <p className="text-muted-foreground">Управление подключенными платформами</p>
                </div>
                <Button onClick={() => router.push('/app/platforms')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Подключить
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-xl p-4">
                  <CardDescription className="text-xs">Всего подключено</CardDescription>
                  <CardTitle className="text-3xl mt-2">{connectedPlatforms.length}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Платформ</p>
                </div>
                <div className="border rounded-xl p-4">
                  <CardDescription className="text-xs">Активных</CardDescription>
                  <CardTitle className="text-3xl mt-2">
                    {connectedPlatforms.filter(p => p.status === 'connected').length}
                  </CardTitle>
                  <p className="text-xs text-green-500 mt-1">Готовы к постингу</p>
                </div>
                <div className="border rounded-xl p-4">
                  <CardDescription className="text-xs">С ошибками</CardDescription>
                  <CardTitle className="text-3xl mt-2">
                    {connectedPlatforms.filter(p => p.status === 'error').length}
                  </CardTitle>
                  <p className="text-xs text-red-500 mt-1">Требуют внимания</p>
                </div>
              </div>

              {/* Platforms List */}
              <Card>
                <CardHeader>
                  <CardTitle>Подключенные платформы</CardTitle>
                  <CardDescription>Управление интеграциями с социальными сетями</CardDescription>
                </CardHeader>
                <CardContent>
                  {connectedPlatforms.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Нет подключенных платформ</p>
                      <Button className="mt-4" onClick={() => router.push('/app/platforms')}>
                        Подключить первую платформу
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {connectedPlatforms.map((platform) => (
                        <div key={platform.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Globe className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{platform.accountName}</p>
                                <p className="text-sm text-muted-foreground capitalize">{platform.platform}</p>
                              </div>
                            </div>
                            {platform.status === 'connected' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                                Подключено
                              </span>
                            )}
                            {platform.status === 'error' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400">
                                Ошибка
                              </span>
                            )}
                            {platform.status === 'pending' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400">
                                Ожидание
                              </span>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => router.push('/app/platforms')}
                          >
                            Управление
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Использование</h2>
                <p className="text-muted-foreground">Статистика использования ресурсов и лимиты</p>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardDescription>Хранилище</CardDescription>
                    <HardDrive className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-4xl">2.4 GB</CardTitle>
                  <p className="text-xs text-muted-foreground mt-2">Из 10 GB использовано</p>
                  <div className="mt-4 pt-4 border-t">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '24%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">7.6 GB свободно</p>
                  </div>
                </div>

                <div className="border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardDescription>Кредиты AI</CardDescription>
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-4xl">3,760</CardTitle>
                  <p className="text-xs text-green-500 mt-2">Осталось из 5,000</p>
                  <div className="mt-4 pt-4 border-t">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Обновление: 1 мая 2026</p>
                  </div>
                </div>

                <div className="border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardDescription>Проекты</CardDescription>
                    <Factory className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-4xl">{projects.length}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-2">Из 20 максимум</p>
                  <div className="mt-4 pt-4 border-t">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(projects.length / 20) * 100}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{20 - projects.length} доступно</p>
                  </div>
                </div>
              </div>

              {/* Usage Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Детализация использования</CardTitle>
                  <CardDescription>Распределение ресурсов по категориям</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Генерация видео
                        </span>
                        <span className="font-medium">1,240 кредитов (49%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '49%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Генерация изображений
                        </span>
                        <span className="font-medium">680 кредитов (27%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '27%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Анализ стиля
                        </span>
                        <span className="font-medium">380 кредитов (15%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Генерация сценариев
                        </span>
                        <span className="font-medium">220 кредитов (9%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '9%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage History */}
              <Card>
                <CardHeader>
                  <CardTitle>История использования</CardTitle>
                  <CardDescription>Последние 7 дней</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { day: 'Пн', credits: 145, generations: 12 },
                      { day: 'Вт', credits: 198, generations: 18 },
                      { day: 'Ср', credits: 167, generations: 15 },
                      { day: 'Чт', credits: 223, generations: 21 },
                      { day: 'Пт', credits: 189, generations: 17 },
                      { day: 'Сб', credits: 98, generations: 8 },
                      { day: 'Вс', credits: 112, generations: 10 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-8 text-sm font-medium">{item.day}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-3">
                              <div 
                                className="bg-primary h-3 rounded-full transition-all" 
                                style={{ width: `${(item.credits / 223) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-20">{item.credits} кр.</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground w-24 text-right">{item.generations} генераций</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Настройки</h2>
                <p className="text-muted-foreground">Управление настройками аккаунта и системы</p>
              </div>

              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Аккаунт
                  </CardTitle>
                  <CardDescription>Основные настройки вашего аккаунта</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button variant="outline" size="sm">Изменить</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Пароль</p>
                      <p className="text-sm text-muted-foreground">Последнее изменение: 30 дней назад</p>
                    </div>
                    <Button variant="outline" size="sm">Обновить</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Двухфакторная аутентификация</p>
                      <p className="text-sm text-muted-foreground">Дополнительная защита аккаунта</p>
                    </div>
                    <Button variant="outline" size="sm">Включить</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Уведомления
                  </CardTitle>
                  <CardDescription>Настройка уведомлений системы</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Email уведомления</p>
                      <p className="text-sm text-muted-foreground">Получать уведомления о завершении генерации</p>
                    </div>
                    <Button variant="outline" size="sm">Включено</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Уведомления об ошибках</p>
                      <p className="text-sm text-muted-foreground">Уведомления при ошибках генерации или публикации</p>
                    </div>
                    <Button variant="outline" size="sm">Включено</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Еженедельный отчет</p>
                      <p className="text-sm text-muted-foreground">Статистика использования за неделю</p>
                    </div>
                    <Button variant="outline" size="sm">Отключено</Button>
                  </div>
                </CardContent>
              </Card>

              {/* API Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Ключи
                  </CardTitle>
                  <CardDescription>Управление ключами для интеграций</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">n8n Webhook URL</p>
                      <Button variant="outline" size="sm">Копировать</Button>
                    </div>
                    <code className="text-xs bg-muted p-2 rounded block">
                      https://your-domain.com/api/factory/webhook/n8n
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Используйте этот URL для интеграции с n8n
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">API Ключ</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Показать</Button>
                        <Button variant="outline" size="sm">Сгенерировать новый</Button>
                      </div>
                    </div>
                    <code className="text-xs bg-muted p-2 rounded block">
                      ••••••••••••••••••••••••
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Используйте для программного доступа к API
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Опасная зона</CardTitle>
                  <CardDescription>Действия, которые нельзя отменить</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium">Удалить все проекты</p>
                      <p className="text-sm text-muted-foreground">Удалить все проекты и связанные данные</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      Удалить все
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium">Удалить аккаунт</p>
                      <p className="text-sm text-muted-foreground">Полностью удалить ваш аккаунт и все данные</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      Удалить аккаунт
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold mb-2">Аналитика</h2>
                <p className="text-muted-foreground">Анализ производительности и эффективности контента</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border rounded-xl p-4">
                  <CardDescription className="text-xs">Всего анализов</CardDescription>
                  <CardTitle className="text-3xl mt-2">24</CardTitle>
                  <p className="text-xs text-green-500 mt-1">+12% за неделю</p>
                </div>
                <div className="border rounded-xl p-4">
                  <CardDescription className="text-xs">Среднее качество</CardDescription>
                  <CardTitle className="text-3xl mt-2">87%</CardTitle>
                  <p className="text-xs text-green-500 mt-1">+5% улучшение</p>
                </div>
                <div className="border rounded-xl p-4">
                  <CardDescription className="text-xs">Референсов обработано</CardDescription>
                  <CardTitle className="text-3xl mt-2">156</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">За все время</p>
                </div>
                <div className="border rounded-xl p-4">
                  <CardDescription className="text-xs">Профилей создано</CardDescription>
                  <CardTitle className="text-3xl mt-2">8</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Уникальных стилей</p>
                </div>
              </div>

              {/* Analysis Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Последние анализы стиля</CardTitle>
                  <CardDescription>Результаты анализа референсов</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { project: 'Бренд одежды Summer', date: '2 часа назад', status: 'completed', accuracy: '92%', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'] },
                      { project: 'Технологический блог', date: '5 часов назад', status: 'completed', accuracy: '88%', colors: ['#667EEA', '#764BA2', '#F093FB'] },
                      { project: 'Фитнес канал', date: '1 день назад', status: 'completed', accuracy: '85%', colors: ['#F093FB', '#F5576C', '#4FACFE'] },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{item.project}</p>
                            <p className="text-sm text-muted-foreground">{item.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex gap-1">
                            {item.colors.map((color, i) => (
                              <div key={i} className="w-6 h-6 rounded border" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Точность</p>
                            <p className="text-lg font-bold text-green-500">{item.accuracy}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold mb-2">Журналы активности</h2>
                <p className="text-muted-foreground">История всех действий и событий в системе</p>
              </div>

              {/* Filters */}
              <div className="flex gap-0 border-b border-border">
                <button
                  onClick={() => setLogFilter('all')}
                  className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                    logFilter === 'all'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setLogFilter('generation')}
                  className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                    logFilter === 'generation'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Генерация
                </button>
                <button
                  onClick={() => setLogFilter('upload')}
                  className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                    logFilter === 'upload'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Загрузка
                </button>
                <button
                  onClick={() => setLogFilter('publish')}
                  className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                    logFilter === 'publish'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Публикация
                </button>
                <button
                  onClick={() => setLogFilter('error')}
                  className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                    logFilter === 'error'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Ошибки
                </button>
              </div>

              {/* Activity Log */}
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {[
                      { time: '14:32', type: 'success', category: 'publish', message: 'Контент успешно опубликован в YouTube Shorts', project: 'Бренд одежды Summer' },
                      { time: '14:15', type: 'info', category: 'generation', message: 'Запущена генерация видео (3 файла)', project: 'Технологический блог' },
                      { time: '13:58', type: 'success', category: 'generation', message: 'Анализ стиля завершен', project: 'Фитнес канал' },
                      { time: '13:42', type: 'warning', category: 'upload', message: 'Загружено 15 референсов', project: 'Бренд одежды Summer' },
                      { time: '12:20', type: 'info', category: 'generation', message: 'Создан новый профиль стиля', project: 'Кулинарный канал' },
                      { time: '11:05', type: 'success', category: 'publish', message: 'Контент успешно опубликован в TikTok', project: 'Модный блог' },
                      { time: '10:30', type: 'error', category: 'error', message: 'Ошибка генерации: таймаут API', project: 'Технологический блог' },
                      { time: '09:15', type: 'info', category: 'upload', message: 'Начат анализ 20 референсов', project: 'Фитнес канал' },
                    ]
                    .filter(log => logFilter === 'all' || log.category === logFilter)
                    .map((log, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                        <div className="text-sm text-muted-foreground w-12 flex-shrink-0">{log.time}</div>
                        <div className="flex-shrink-0">
                          {log.type === 'success' && <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />}
                          {log.type === 'info' && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />}
                          {log.type === 'warning' && <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />}
                          {log.type === 'error' && <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{log.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{log.project}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'speed' && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold mb-2">Производительность</h2>
                <p className="text-muted-foreground">Скорость генерации и метрики эффективности</p>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardDescription>Среднее время генерации</CardDescription>
                    <Gauge className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-4xl">2.4s</CardTitle>
                  <p className="text-xs text-green-500 mt-2">↓ 15% быстрее</p>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">Изображение: 1.2s • Видео: 3.8s</p>
                  </div>
                </div>

                <div className="border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardDescription>Всего сгенерировано</CardDescription>
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-4xl">342</CardTitle>
                  <p className="text-xs text-green-500 mt-2">↑ 28% за неделю</p>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">Видео: 156 • Изображения: 186</p>
                  </div>
                </div>

                <div className="border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardDescription>Использовано кредитов</CardDescription>
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-4xl">1,240</CardTitle>
                  <p className="text-xs text-muted-foreground mt-2">Осталось: 3,760</p>
                  <div className="mt-4 pt-4 border-t">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Speed History */}
              <Card>
                <CardHeader>
                  <CardTitle>История производительности</CardTitle>
                  <CardDescription>Среднее время генерации за последние 7 дней</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { day: 'Пн', time: '2.8s', count: 45 },
                      { day: 'Вт', time: '2.6s', count: 52 },
                      { day: 'Ср', time: '2.4s', count: 48 },
                      { day: 'Чт', time: '2.5s', count: 61 },
                      { day: 'Пт', time: '2.3s', count: 55 },
                      { day: 'Сб', time: '2.2s', count: 38 },
                      { day: 'Вс', time: '2.4s', count: 43 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-8 text-sm font-medium">{item.day}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-3">
                              <div 
                                className="bg-primary h-3 rounded-full transition-all" 
                                style={{ width: `${(2.8 - parseFloat(item.time)) / 0.6 * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12">{item.time}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground w-20 text-right">{item.count} генераций</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'ai-gateway' && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold mb-2">Шлюз ИИ</h2>
                <p className="text-muted-foreground">Управление AI моделями и интеграциями</p>
              </div>

              {/* AI Models Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-green-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Stability AI</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-green-500 font-medium">Активен</span>
                      </div>
                    </div>
                    <CardDescription>Генерация изображений</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Модель</span>
                        <span className="font-medium">SDXL 1.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Запросов сегодня</span>
                        <span className="font-medium">124</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Среднее время</span>
                        <span className="font-medium">1.2s</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Runway ML</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-green-500 font-medium">Активен</span>
                      </div>
                    </div>
                    <CardDescription>Генерация видео</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Модель</span>
                        <span className="font-medium">Gen-2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Запросов сегодня</span>
                        <span className="font-medium">48</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Среднее время</span>
                        <span className="font-medium">3.8s</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">OpenAI GPT-4</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-green-500 font-medium">Активен</span>
                      </div>
                    </div>
                    <CardDescription>Генерация сценариев и ТЗ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Модель</span>
                        <span className="font-medium">gpt-4-turbo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Запросов сегодня</span>
                        <span className="font-medium">87</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Среднее время</span>
                        <span className="font-medium">2.1s</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">n8n Webhook</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-xs text-yellow-500 font-medium">Тестирование</span>
                      </div>
                    </div>
                    <CardDescription>Автоматический постинг</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Статус</span>
                        <span className="font-medium">Настройка</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Площадок подключено</span>
                        <span className="font-medium">2/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Последний запуск</span>
                        <span className="font-medium">2 часа назад</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* API Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Использование API</CardTitle>
                  <CardDescription>Распределение запросов по моделям</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Stability AI</span>
                        <span className="font-medium">124 запроса (48%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '48%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Runway ML</span>
                        <span className="font-medium">48 запросов (19%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '19%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>OpenAI GPT-4</span>
                        <span className="font-medium">87 запросов (33%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '33%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
