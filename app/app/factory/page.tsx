'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
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

type TabType = 'projects' | 'analysis' | 'logs' | 'speed' | 'ai-gateway';

export default function ContentFactoryPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [hoveredTab, setHoveredTab] = useState<TabType | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
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

  // Update indicator position
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
    updateIndicator(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (hoveredTab) {
      updateIndicator(hoveredTab);
    } else {
      updateIndicator(activeTab);
    }
  }, [hoveredTab, activeTab]);

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
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Контент-Завод</h1>
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

          {/* Navigation Tabs */}
          <div className="factory-tabs-container border-y" ref={tabsRef}>
            {/* Sliding indicator */}
            <div 
              className="tab-indicator"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
              }}
            />
            
            <button
              ref={(el) => {
                if (el) tabElementsRef.current.set('projects', el);
              }}
              onClick={() => setActiveTab('projects')}
              onMouseEnter={() => setHoveredTab('projects')}
              onMouseLeave={() => setHoveredTab(null)}
              className={`factory-tab-button ${activeTab === 'projects' ? 'active' : ''}`}
            >
              <Factory className="w-4 h-4" />
              Проекты
            </button>
            <button
              ref={(el) => {
                if (el) tabElementsRef.current.set('analysis', el);
              }}
              onClick={() => setActiveTab('analysis')}
              onMouseEnter={() => setHoveredTab('analysis')}
              onMouseLeave={() => setHoveredTab(null)}
              className={`factory-tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
            >
              <BarChart3 className="w-4 h-4" />
              Анализ
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
                if (el) tabElementsRef.current.set('speed', el);
              }}
              onClick={() => setActiveTab('speed')}
              onMouseEnter={() => setHoveredTab('speed')}
              onMouseLeave={() => setHoveredTab(null)}
              className={`factory-tab-button ${activeTab === 'speed' ? 'active' : ''}`}
            >
              <Gauge className="w-4 h-4" />
              Информация о скорости
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
          </div>

          {/* Projects Tab Content */}
          {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Мои проекты</h2>
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
                  <Card key={project._id} className="hover:shadow-lg transition-shadow cursor-pointer">
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

          {activeTab === 'analysis' && (
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
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-md bg-[#8B9A46] text-white text-sm font-medium">Все</button>
                <button className="px-4 py-2 rounded-md bg-muted text-sm font-medium hover:bg-muted/80">Генерация</button>
                <button className="px-4 py-2 rounded-md bg-muted text-sm font-medium hover:bg-muted/80">Загрузка</button>
                <button className="px-4 py-2 rounded-md bg-muted text-sm font-medium hover:bg-muted/80">Публикация</button>
              </div>

              {/* Activity Log */}
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {[
                      { time: '14:32', type: 'success', message: 'Контент успешно опубликован в YouTube Shorts', project: 'Бренд одежды Summer' },
                      { time: '14:15', type: 'info', message: 'Запущена генерация видео (3 файла)', project: 'Технологический блог' },
                      { time: '13:58', type: 'success', message: 'Анализ стиля завершен', project: 'Фитнес канал' },
                      { time: '13:42', type: 'warning', message: 'Загружено 15 референсов', project: 'Бренд одежды Summer' },
                      { time: '12:20', type: 'info', message: 'Создан новый профиль стиля', project: 'Кулинарный канал' },
                      { time: '11:05', type: 'success', message: 'Контент успешно опубликован в TikTok', project: 'Модный блог' },
                      { time: '10:30', type: 'error', message: 'Ошибка генерации: таймаут API', project: 'Технологический блог' },
                      { time: '09:15', type: 'info', message: 'Начат анализ 20 референсов', project: 'Фитнес канал' },
                    ].map((log, idx) => (
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
