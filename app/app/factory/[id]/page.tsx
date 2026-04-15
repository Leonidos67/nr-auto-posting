'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Factory,
  Upload,
  Video,
  Sparkles,
  Settings,
  Play,
  Trash2,
  Edit,
  ExternalLink,
  BarChart3,
  FileText,
  Gauge,
  Network,
  Globe,
  Clock,
  GitBranch,
  Activity,
  Shield,
  Database,
  Flag,
  Bot,
  TestTube,
  Zap,
  LifeBuoy,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import '@/components/FactoryTabs.css';

interface ContentProject {
  _id: string;
  name: string;
  description: string;
  status: 'draft' | 'generating' | 'ready' | 'posted';
  referenceCount: number;
  contentCount: number;
  platforms: string[];
  styleProfile?: {
    colors: string[];
    mood: string;
    tempo: string;
    musicStyle?: string;
    visualStyle?: string;
  };
  settings: {
    aspectRatio: string;
    videoDuration: number;
    targetPlatforms: string[];
  };
  createdAt: string;
  updatedAt: string;
}

type TabType = 'overview' | 'deployments' | 'logs' | 'analytics' | 'speed' | 'observability' | 'firewall' | 'cdn' | 'domains' | 'integrations' | 'storage' | 'flags' | 'agent' | 'ai-gateway' | 'sandboxes' | 'usage' | 'support' | 'settings';

interface StyleReference {
  _id: string;
  fileName: string;
  fileType: 'video' | 'image' | 'audio';
  analysisStatus: string;
}

export default function ProjectSettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  
  const [project, setProject] = useState<ContentProject | null>(null);
  const [references, setReferences] = useState<StyleReference[]>([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
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
    if (projectId) {
      fetchProject();
      fetchReferences();
    }
  }, [projectId]);

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

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/factory/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoadingProject(false);
    }
  };

  const fetchReferences = async () => {
    try {
      const response = await fetch(`/api/factory/projects/${projectId}/references`);
      if (response.ok) {
        const data = await response.json();
        setReferences(data.references || []);
      }
    } catch (error) {
      console.error('Error fetching references:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteProject = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот проект?')) {
      return;
    }

    try {
      const response = await fetch(`/api/factory/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/app/factory');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Ошибка при удалении проекта');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Черновик</Badge>;
      case 'generating':
        return <Badge variant="default" className="bg-yellow-500">Генерация</Badge>;
      case 'ready':
        return <Badge variant="default" className="bg-green-500">Готов</Badge>;
      case 'posted':
        return <Badge variant="default">Опубликован</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube-shorts':
        return '🎬';
      case 'tiktok':
        return '🎵';
      case 'instagram-reels':
        return '📸';
      case 'pinterest':
        return '📌';
      default:
        return '🌐';
    }
  };

  if (loading || loadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm">секундочку...</div>
      </div>
    );
  }

  if (!user || !project) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={handleLogout} />
      <SidebarInset className="overflow-x-hidden">
        <div className="flex-1">
          {/* Project Header - Vercel Style */}
          <div className="border-b">
            <div className="mx-auto px-8 py-6">
              {/* Top Section */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/app/factory')}
                    className="mt-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B9A46] to-[#6B7A36] flex items-center justify-center">
                        <Factory className="w-5 h-5 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold">{project.name}</h1>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {project.description || 'Проект контент-завода'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Настройки
                  </Button>
                  <Button size="sm" className="gap-2 bg-[#8B9A46] hover:bg-[#7a8a3d]">
                    <Play className="w-4 h-4" />
                    Запустить
                  </Button>
                </div>
              </div>

              {/* Project Info Bar */}
              <div className="flex items-center gap-6 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Референсы:</span>
                  <span className="font-medium">{project.referenceCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Контент:</span>
                  <span className="font-medium">{project.contentCount} видео</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Создан:</span>
                  <span className="font-medium">{new Date(project.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="factory-tabs-container" ref={tabsRef}>
                {/* Sliding indicator */}
                <div 
                  className="tab-indicator"
                  style={{
                    left: `${indicatorStyle.left}px`,
                    width: `${indicatorStyle.width}px`,
                  }}
                />
                
                <button
                  ref={(el) => { if (el) tabElementsRef.current.set('overview', el); }}
                  onClick={() => setActiveTab('overview')}
                  onMouseEnter={() => setHoveredTab('overview')}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`factory-tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                >
                  Обзор
                </button>
                <button
                  ref={(el) => { if (el) tabElementsRef.current.set('deployments', el); }}
                  onClick={() => setActiveTab('deployments')}
                  onMouseEnter={() => setHoveredTab('deployments')}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`factory-tab-button ${activeTab === 'deployments' ? 'active' : ''}`}
                >
                  Генерации
                </button>
                <button
                  ref={(el) => { if (el) tabElementsRef.current.set('logs', el); }}
                  onClick={() => setActiveTab('logs')}
                  onMouseEnter={() => setHoveredTab('logs')}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`factory-tab-button ${activeTab === 'logs' ? 'active' : ''}`}
                >
                  Журналы
                </button>
                <button
                  ref={(el) => { if (el) tabElementsRef.current.set('analytics', el); }}
                  onClick={() => setActiveTab('analytics')}
                  onMouseEnter={() => setHoveredTab('analytics')}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`factory-tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                >
                  Аналитика
                </button>
                <button
                  ref={(el) => { if (el) tabElementsRef.current.set('speed', el); }}
                  onClick={() => setActiveTab('speed')}
                  onMouseEnter={() => setHoveredTab('speed')}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`factory-tab-button ${activeTab === 'speed' ? 'active' : ''}`}
                >
                  Скорость
                </button>
                <button
                  ref={(el) => { if (el) tabElementsRef.current.set('domains', el); }}
                  onClick={() => setActiveTab('domains')}
                  onMouseEnter={() => setHoveredTab('domains')}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`factory-tab-button ${activeTab === 'domains' ? 'active' : ''}`}
                >
                  Площадки
                </button>
                <button
                  ref={(el) => { if (el) tabElementsRef.current.set('ai-gateway', el); }}
                  onClick={() => setActiveTab('ai-gateway')}
                  onMouseEnter={() => setHoveredTab('ai-gateway')}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`factory-tab-button ${activeTab === 'ai-gateway' ? 'active' : ''}`}
                >
                  Шлюз ИИ
                </button>
                <button
                  ref={(el) => { if (el) tabElementsRef.current.set('usage', el); }}
                  onClick={() => setActiveTab('usage')}
                  onMouseEnter={() => setHoveredTab('usage')}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`factory-tab-button ${activeTab === 'usage' ? 'active' : ''}`}
                >
                  Использование
                </button>
                <button
                  ref={(el) => { if (el) tabElementsRef.current.set('settings', el); }}
                  onClick={() => setActiveTab('settings')}
                  onMouseEnter={() => setHoveredTab('settings')}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`factory-tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                >
                  Настройки
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mx-auto px-8 py-8 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
            <>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/app/factory/${projectId}/upload`)}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Референсы</h3>
                    <p className="text-sm text-muted-foreground">{project.referenceCount} файлов</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/app/factory/${projectId}/generate`)}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Генерация</h3>
                    <p className="text-sm text-muted-foreground">Создать контент</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Video className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Контент</h3>
                    <p className="text-sm text-muted-foreground">{project.contentCount} видео</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Publish Action */}
          {project.status === 'ready' && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Контент готов к публикации</h3>
                    <p className="text-sm text-muted-foreground">
                      Опубликуйте контент на подключенных платформах
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    className="gap-2"
                    onClick={() => router.push(`/app/factory/${projectId}/publish`)}
                  >
                    <Send className="w-5 h-5" />
                    Опубликовать
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Информация о проекте
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Описание</p>
                  <p className="font-medium">{project.description || 'Нет описания'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Целевые площадки</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.settings?.targetPlatforms?.map((platform) => (
                      <div key={platform} className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted">
                        <span>{getPlatformIcon(platform)}</span>
                        <span className="text-sm">{platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Формат видео</p>
                    <p className="font-medium">{project.settings?.aspectRatio || '9:16'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Длительность</p>
                    <p className="font-medium">{project.settings?.videoDuration || 60} сек</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Создан</p>
                  <p className="font-medium">
                    {new Date(project.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Style Profile */}
            {project.styleProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Профиль стиля
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Настроение</p>
                      <p className="font-medium capitalize">{project.styleProfile.mood}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Темп</p>
                      <p className="font-medium capitalize">{project.styleProfile.tempo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Стиль музыки</p>
                      <p className="font-medium">{project.styleProfile.musicStyle || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Визуальный стиль</p>
                      <p className="font-medium">{project.styleProfile.visualStyle || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Цветовая палитра</p>
                    <div className="flex gap-2">
                      {project.styleProfile.colors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-12 h-12 rounded-lg border-2 border-white shadow-md"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent References */}
          {references.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Последние референсы</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/app/factory/${projectId}/upload`)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Загрузить ещё
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {references.slice(0, 8).map((ref) => (
                    <div
                      key={ref._id}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary text-xs">
                          {ref.fileType === 'video' ? '🎬' : ref.fileType === 'image' ? '🖼️' : '🎵'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{ref.fileName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{ref.fileType}</p>
                        </div>
                      </div>
                      <div className="text-xs">
                        {ref.analysisStatus === 'completed' && (
                          <span className="text-green-500">✓ Анализ завершен</span>
                        )}
                        {ref.analysisStatus === 'analyzing' && (
                          <span className="text-yellow-500">⏳ Анализ...</span>
                        )}
                        {ref.analysisStatus === 'pending' && (
                          <span className="text-muted-foreground">Ожидает анализа</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Опасная зона</CardTitle>
              <CardDescription>
                Необратимые действия с проектом
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                <div>
                  <p className="font-medium">Удалить проект</p>
                  <p className="text-sm text-muted-foreground">
                    Это действие нельзя отменить. Все данные проекта будут удалены.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProject}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Удалить проект
                </Button>
              </div>
            </CardContent>
          </Card>
            </>
            )}

            {/* Deployments Tab */}
            {activeTab === 'deployments' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Генерации контента</h2>
                  <p className="text-muted-foreground">История всех генераций и их статус</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border rounded-xl p-4">
                    <CardDescription>Всего генераций</CardDescription>
                    <CardTitle className="text-3xl mt-2">{project.contentCount}</CardTitle>
                    <p className="text-xs text-green-500 mt-1">+12 за неделю</p>
                  </div>
                  <div className="border rounded-xl p-4">
                    <CardDescription>Опубликовано</CardDescription>
                    <CardTitle className="text-3xl mt-2 text-green-500">
                      {project.status === 'posted' ? project.contentCount : Math.floor(project.contentCount * 0.7)}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Успешно</p>
                  </div>
                  <div className="border rounded-xl p-4">
                    <CardDescription>Готово к постингу</CardDescription>
                    <CardTitle className="text-3xl mt-2 text-blue-500">
                      {project.status === 'ready' ? project.contentCount : 3}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Ожидают</p>
                  </div>
                  <div className="border rounded-xl p-4">
                    <CardDescription>В генерации</CardDescription>
                    <CardTitle className="text-3xl mt-2 text-yellow-500">
                      {project.status === 'generating' ? 2 : 0}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Процесс</p>
                  </div>
                </div>

                {/* Deployment List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Последние генерации</CardTitle>
                    <CardDescription>История создания видеоконтента</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { id: 'GEN-156', name: 'Обзор новой коллекции', status: 'posted', platform: 'YouTube Shorts', time: '2 часа назад', duration: '45 сек' },
                        { id: 'GEN-155', name: 'Топ-5 трендов сезона', status: 'ready', platform: 'TikTok', time: '5 часов назад', duration: '60 сек' },
                        { id: 'GEN-154', name: 'Как использовать продукт', status: 'ready', platform: 'Instagram Reels', time: '1 день назад', duration: '30 сек' },
                        { id: 'GEN-153', name: 'Отзывы клиентов', status: 'generating', platform: 'YouTube Shorts', time: '2 дня назад', duration: '-' },
                        { id: 'GEN-152', name: 'Сравнение моделей', status: 'posted', platform: 'TikTok', time: '3 дня назад', duration: '50 сек' },
                      ].map((deployment, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Video className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{deployment.name}</p>
                              <p className="text-sm text-muted-foreground">{deployment.id} • {deployment.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Площадка</p>
                              <p className="text-sm font-medium">{deployment.platform}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Длительность</p>
                              <p className="text-sm font-medium">{deployment.duration}</p>
                            </div>
                            <Badge className={deployment.status === 'posted' ? 'bg-green-500' : deployment.status === 'ready' ? 'bg-blue-500' : 'bg-yellow-500'}>
                              {deployment.status === 'posted' ? 'Опубликован' : deployment.status === 'ready' ? 'Готов' : 'Генерация'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Журналы активности</h2>
                  <p className="text-muted-foreground">Детальная история всех действий в проекте</p>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-md bg-[#8B9A46] text-white text-sm font-medium">Все</button>
                  <button className="px-4 py-2 rounded-md bg-muted text-sm font-medium hover:bg-muted/80">Генерация</button>
                  <button className="px-4 py-2 rounded-md bg-muted text-sm font-medium hover:bg-muted/80">Загрузка</button>
                  <button className="px-4 py-2 rounded-md bg-muted text-sm font-medium hover:bg-muted/80">Публикация</button>
                  <button className="px-4 py-2 rounded-md bg-muted text-sm font-medium hover:bg-muted/80">Ошибки</button>
                </div>

                {/* Activity Log */}
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {[
                        { time: '14:32', type: 'success', message: 'Видео опубликовано в YouTube Shorts', detail: 'Обзор новой коллекции' },
                        { time: '14:30', type: 'info', message: 'Генерация видео завершена', detail: 'GEN-156 • 45 сек' },
                        { time: '14:25', type: 'info', message: 'Начата генерация видео из 30 изображений', detail: 'GEN-156' },
                        { time: '14:20', type: 'success', message: 'Загружено 15 новых референсов', detail: '10 изображений, 5 видео' },
                        { time: '13:58', type: 'warning', message: 'Анализ стиля завершен с предупреждениями', detail: 'Низкое качество 2 файлов' },
                        { time: '13:45', type: 'info', message: 'Запущен анализ референсов', detail: 'Создание профиля стиля' },
                        { time: '12:30', type: 'error', message: 'Ошибка генерации: таймаут API', detail: 'GEN-153 • Повторная попытка' },
                        { time: '11:15', type: 'success', message: 'Видео опубликовано в TikTok', detail: 'Топ-5 трендов сезона' },
                      ].map((log, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                          <div className="text-sm text-muted-foreground w-16 flex-shrink-0 font-mono">{log.time}</div>
                          <div className="flex-shrink-0">
                            {log.type === 'success' && <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />}
                            {log.type === 'info' && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />}
                            {log.type === 'warning' && <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />}
                            {log.type === 'error' && <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{log.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{log.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Аналитика контента</h2>
                  <p className="text-muted-foreground">Метрики эффективности и вовлеченности</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <CardDescription>Просмотры</CardDescription>
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-4xl">24.5K</CardTitle>
                    <p className="text-xs text-green-500 mt-2">↑ 32% за неделю</p>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">YouTube: 12.3K • TikTok: 8.7K • IG: 3.5K</p>
                    </div>
                  </div>

                  <div className="border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <CardDescription>Вовлеченность</CardDescription>
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-4xl">8.7%</CardTitle>
                    <p className="text-xs text-green-500 mt-2">↑ 2.1% улучшение</p>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">Лайки: 2.1K • Комментарии: 342</p>
                    </div>
                  </div>

                  <div className="border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <CardDescription>Новые подписчики</CardDescription>
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-4xl">+1.2K</CardTitle>
                    <p className="text-xs text-green-500 mt-2">↑ 18% рост</p>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">YouTube: +680 • TikTok: +420</p>
                    </div>
                  </div>
                </div>

                {/* Top Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Топ контент по просмотрам</CardTitle>
                    <CardDescription>Самые популярные видео</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'Обзор новой коллекции', views: '12.3K', engagement: '15.2%', platform: 'YouTube Shorts' },
                        { name: 'Топ-5 трендов сезона', views: '8.7K', engagement: '12.8%', platform: 'TikTok' },
                        { name: 'Как использовать продукт', views: '5.4K', engagement: '10.5%', platform: 'Instagram Reels' },
                        { name: 'Сравнение моделей', views: '3.2K', engagement: '9.3%', platform: 'TikTok' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold text-muted-foreground/30 w-8">#{idx + 1}</div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.platform}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Просмотры</p>
                              <p className="text-lg font-bold">{item.views}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Вовлеченность</p>
                              <p className="text-lg font-bold text-green-500">{item.engagement}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Speed Tab */}
            {activeTab === 'speed' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Производительность</h2>
                  <p className="text-muted-foreground">Скорость генерации и стабильность системы</p>
                </div>

                {/* Speed Metrics */}
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
                      <CardDescription>Генераций в час</CardDescription>
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-4xl">42</CardTitle>
                    <p className="text-xs text-green-500 mt-2">↑ 28% больше</p>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">Пик: 67 генераций/час</p>
                    </div>
                  </div>

                  <div className="border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <CardDescription>Время работы</CardDescription>
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-4xl">99.9%</CardTitle>
                    <p className="text-xs text-green-500 mt-2">Стабильно</p>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">Простой: 43 мин/месяц</p>
                    </div>
                  </div>
                </div>

                {/* Speed History Chart */}
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
                                  style={{ width: `${(2.8 - parseFloat(item.time)) / 0.6 * 100 + 20}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-12">{item.time}</span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground w-24 text-right">{item.count} генераций</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Domains Tab */}
            {activeTab === 'domains' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Подключенные площадки</h2>
                    <p className="text-muted-foreground">Платформы для автоматической публикации</p>
                  </div>
                  <Button className="bg-[#8B9A46] hover:bg-[#7a8a3d] gap-2">
                    <Globe className="w-4 h-4" />
                    Подключить площадку
                  </Button>
                </div>

                {/* Connected Platforms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'YouTube Shorts', status: 'active', icon: '🎬', posts: 45, followers: '12.3K', lastPost: '2 часа назад' },
                    { name: 'TikTok', status: 'active', icon: '🎵', posts: 38, followers: '8.7K', lastPost: '5 часов назад' },
                    { name: 'Instagram Reels', status: 'active', icon: '📸', posts: 28, followers: '5.4K', lastPost: '1 день назад' },
                    { name: 'Pinterest', status: 'warning', icon: '📌', posts: 15, followers: '2.1K', lastPost: '3 дня назад' },
                  ].map((platform, idx) => (
                    <Card key={idx} className={platform.status === 'active' ? 'border-green-200' : 'border-yellow-200'}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{platform.icon}</div>
                            <div>
                              <CardTitle className="text-base">{platform.name}</CardTitle>
                              <CardDescription>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${platform.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                  <span className={platform.status === 'active' ? 'text-green-500' : 'text-yellow-500'}>
                                    {platform.status === 'active' ? 'Подключено' : 'Требует внимания'}
                                  </span>
                                </div>
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Публикаций</p>
                            <p className="font-bold text-lg">{platform.posts}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Подписчики</p>
                            <p className="font-bold text-lg">{platform.followers}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Последний пост</p>
                            <p className="font-bold text-sm">{platform.lastPost}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* AI Gateway Tab */}
            {activeTab === 'ai-gateway' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Шлюз ИИ</h2>
                  <p className="text-muted-foreground">Управление AI моделями и интеграциями</p>
                </div>

                {/* AI Models Grid */}
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
                      <CardDescription>Генерация сценариев</CardDescription>
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
                          <span className="text-xs text-yellow-500 font-medium">Настройка</span>
                        </div>
                      </div>
                      <CardDescription>Автоматический постинг</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Статус</span>
                          <span className="font-medium">Тестирование</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Площадок</span>
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

            {/* Usage Tab */}
            {activeTab === 'usage' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Использование ресурсов</h2>
                  <p className="text-muted-foreground">Статистика потребления и лимиты</p>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-xl p-6">
                    <CardDescription className="mb-2">Кредиты</CardDescription>
                    <CardTitle className="text-4xl mb-2">1,240 / 5,000</CardTitle>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-primary h-3 rounded-full" style={{ width: '25%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Использовано 25%</p>
                  </div>

                  <div className="border rounded-xl p-6">
                    <CardDescription className="mb-2">Хранилище</CardDescription>
                    <CardTitle className="text-4xl mb-2">2.4 GB / 10 GB</CardTitle>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '24%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Использовано 24%</p>
                  </div>

                  <div className="border rounded-xl p-6">
                    <CardDescription className="mb-2">API Запросы</CardDescription>
                    <CardTitle className="text-4xl mb-2">259 / 10,000</CardTitle>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: '3%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Использовано 3%</p>
                  </div>
                </div>

                {/* Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Детализация использования</CardTitle>
                    <CardDescription>Расход за последние 30 дней</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Video className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">Генерация видео</p>
                            <p className="text-sm text-muted-foreground">Runway ML</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">680 кредитов</p>
                          <p className="text-xs text-muted-foreground">48 видео</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">Генерация изображений</p>
                            <p className="text-sm text-muted-foreground">Stability AI</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">420 кредитов</p>
                          <p className="text-xs text-muted-foreground">156 изображений</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">Генерация сценариев</p>
                            <p className="text-sm text-muted-foreground">OpenAI GPT-4</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">140 кредитов</p>
                          <p className="text-xs text-muted-foreground">87 запросов</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Настройки проекта</h2>
                  <p className="text-muted-foreground">Управление параметрами и конфигурацией</p>
                </div>

                {/* General Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Основные настройки</CardTitle>
                    <CardDescription>Общие параметры проекта</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Название проекта</p>
                        <p className="text-sm text-muted-foreground">{project.name}</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="w-4 h-4" />
                        Изменить
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Формат видео</p>
                        <p className="text-sm text-muted-foreground">{project.settings?.aspectRatio || '9:16'}</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="w-4 h-4" />
                        Настроить
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Длительность видео</p>
                        <p className="text-sm text-muted-foreground">{project.settings?.videoDuration || 60} секунд</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="w-4 h-4" />
                        Изменить
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-400">Опасная зона</CardTitle>
                    <CardDescription>Необратимые действия</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                      <div>
                        <p className="font-medium">Удалить проект</p>
                        <p className="text-sm text-muted-foreground">
                          Это действие нельзя отменить. Все данные проекта будут удалены.
                        </p>
                      </div>
                      <Button variant="destructive" onClick={handleDeleteProject} className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Удалить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
