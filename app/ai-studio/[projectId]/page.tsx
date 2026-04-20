'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
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
  Bell,
  ArrowUpRightIcon,
  Key,
  Webhook,
  Palette,
  Calendar,
  Monitor,
  Lock,
  Users,
  Eye,
  RotateCcw,
  Download,
  Image as ImageIcon,
  Music,
  Check,
  Loader2,
  Search,
  X,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronsUpDown } from 'lucide-react';
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

type TabType = 'overview' | 'deployments' | 'logs' | 'analytics' | 'speed' | 'observability' | 'firewall' | 'cdn' | 'integrations' | 'storage' | 'flags' | 'agent' | 'ai-gateway' | 'sandboxes' | 'usage' | 'support' | 'settings' | 'upload';

interface StyleReference {
  _id: string;
  fileName: string;
  fileType: 'video' | 'image' | 'audio';
  fileSize?: number;
  fileUrl?: string;
  analysisStatus: 'pending' | 'analyzing' | 'completed' | 'failed';
  createdAt?: string;
}

export default function ProjectSettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  
  const [project, setProject] = useState<ContentProject | null>(null);
  const [allProjects, setAllProjects] = useState<ContentProject[]>([]);
  const [references, setReferences] = useState<StyleReference[]>([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [hoveredTab, setHoveredTab] = useState<TabType | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [projectSearch, setProjectSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'generation' | 'upload' | 'publish' | 'error'>('all');
  const [settingsFilter, setSettingsFilter] = useState<'general' | 'security' | 'content' | 'platforms' | 'publishing' | 'ai' | 'advanced'>('general');
  const [deploymentsFilter, setDeploymentsFilter] = useState<'all' | 'posted' | 'ready' | 'generating'>('all');
  const [analyticsFilter, setAnalyticsFilter] = useState<'overview' | 'engagement' | 'platforms' | 'content'>('overview');
  const [speedFilter, setSpeedFilter] = useState<'overview' | 'history' | 'models'>('overview');
  const [aiGatewayFilter, setAiGatewayFilter] = useState<'overview' | 'models' | 'usage'>('overview');
  const [usageFilter, setUsageFilter] = useState<'overview' | 'credits' | 'storage' | 'history'>('overview');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      fetchAllProjects();
      fetchReferences();
    }
  }, [projectId]);

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

  const fetchAllProjects = async () => {
    try {
      const response = await fetch('/api/factory/projects');
      if (response.ok) {
        const data = await response.json();
        setAllProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching all projects:', error);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles: StyleReference[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Определяем тип файла
        let fileType: 'video' | 'image' | 'audio' = 'video';
        if (file.type.startsWith('image/')) fileType = 'image';
        else if (file.type.startsWith('audio/')) fileType = 'audio';

        // Загружаем файл (в реальном проекте здесь будет загрузка на S3/Cloudinary)
        // Пока используем base64 для демонстрации
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const response = await fetch(`/api/factory/projects/${projectId}/references`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType,
            fileSize: file.size,
            fileUrl: base64,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          uploadedFiles.push(data.reference);
        }

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      setReferences(prev => [...prev, ...uploadedFiles]);
      
      // Обновляем проект после загрузки
      fetchProject();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Ошибка при загрузке файлов');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAnalyzeReferences = async () => {
    setAnalyzing(true);
    
    try {
      const response = await fetch(`/api/factory/projects/${projectId}/analyze`, {
        method: 'POST',
      });

      if (response.ok) {
        // Обновляем статусы референсов
        await fetchReferences();
        alert('Анализ завершен! Профиль стиля создан.');
        
        // Переход к генерации контента
        router.push(`/ai-studio/${projectId}/generate`);
      }
    } catch (error) {
      console.error('Error analyzing references:', error);
      alert('Ошибка при анализе');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteReference = async (referenceId: string) => {
    try {
      const response = await fetch(`/api/factory/projects/${projectId}/references/${referenceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReferences(prev => prev.filter(r => r._id !== referenceId));
      }
    } catch (error) {
      console.error('Error deleting reference:', error);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      case 'audio':
        return <Music className="w-5 h-5" />;
      default:
        return <Video className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getProviderLogo = (provider: string) => {
    const logos: Record<string, string> = {
      'Google': 'https://img.icons8.com/?size=100&id=17949&format=png&color=ffffff',
      'OpenAI': 'https://img.icons8.com/?size=100&id=Nts60kQIvGqe&format=png&color=ffffff',
      'Anthropic': 'https://img.icons8.com/?size=100&id=zQjzFjPpT2Ek&format=png&color=000000',
      'xAI': 'https://img.icons8.com/?size=100&id=USGXKHXKl9X7&format=png&color=ffffff',
      'Meta': 'https://img.icons8.com/?size=100&id=PvvcWRWxRKSR&format=png&color=000000',
      'Amazon': 'https://img.icons8.com/?size=100&id=21295&format=png&color=000000',
      'Xiaomi': 'https://img.icons8.com/?size=100&id=32261&format=png&color=000000',
      // 'Stability AI': '',
      'Perplexity': 'https://img.icons8.com/?size=100&id=kzJWN5jCDzpq&format=png&color=000000',
      'DeepSeek': 'https://img.icons8.com/?size=100&id=YWOidjGxCpFW&format=png&color=000000',
      'NVIDIA': 'https://img.icons8.com/?size=100&id=eLp0UzmXETI1&format=png&color=000000',
      'Mistral': 'https://img.icons8.com/?size=100&id=20998&format=png&color=000000',
    };
    return logos[provider];
  };

  // Provider Logo Component
  const ProviderLogo = ({ provider }: { provider: string }) => {
    const logoUrl = getProviderLogo(provider);
    const initial = provider.charAt(0);

    if (logoUrl) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 bg-white/10">
            <Image src={logoUrl} alt={provider} width={24} height={24} className="w-full h-full object-cover" />
          </div>
          <span className="font-medium">{provider}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded ${fallbackColor} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
          {initial}
        </div>
        <span className="font-medium">{provider}</span>
      </div>
    );
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
        router.push('/ai-studio');
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
        return <Badge variant="default" className="border border-border bg-black/0 text-white">Готов</Badge>;
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
        <div className="flex-1">
          {/* Project Header - Vercel Style */}
          <div className="border-b">
            <div className="mx-auto">

              <div className='flex items-start justify-between px-4 mb-2'></div>
              {/* Top Section */}
              {/* <div className="flex items-start justify-between px-4 pt-4 mb-2">
                <div className="flex items-start gap-2">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center border gap-2 hover:bg-muted/50 px-2 py-1.5 rounded-md transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-lg bg-[#8B9A46] flex items-center justify-center flex-shrink-0">
                              <Factory className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <h1 className="text-sm font-bold">{project.name}</h1>
                                <ChevronsUpDown className="w-3 h-3 text-muted-foreground" />
                              </div>
                            </div>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-80">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="Поиск проектов..."
                              value={projectSearch}
                              onChange={(e) => setProjectSearch(e.target.value)}
                              className="w-full pl-9 pr-8 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            {projectSearch && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProjectSearch('');
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors"
                              >
                                <X className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            )}
                          </div>

                          <div className="max-h-64 overflow-y-auto space-y-1 p-1">
                            {allProjects
                              .filter((p) => 
                                p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
                                (p.description && p.description.toLowerCase().includes(projectSearch.toLowerCase()))
                              )
                              .map((p) => (
                                <DropdownMenuItem
                                  key={p._id}
                                  onClick={() => router.push(`/ai-studio/${p._id}`)}
                                  className={`flex items-start gap-2 p-2.5 rounded-lg cursor-pointer ${
                                    p._id === projectId ? 'bg-muted' : 'hover:bg-muted/50'
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-[#8B9A46]/20 flex items-center justify-center flex-shrink-0">
                                    <Factory className="w-4 h-4 text-[#8B9A46]" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{p.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {p.description || 'Нет описания'}
                                    </p>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            
                            {allProjects.filter((p) => 
                              p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
                              (p.description && p.description.toLowerCase().includes(projectSearch.toLowerCase()))
                            ).length === 0 && (
                              <div className="text-center py-6 text-muted-foreground">
                                <p className="text-sm">Проекты не найдены</p>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => router.push('/ai-studio/new')}
                            className="w-full flex items-center border-t justify-center gap-2 px-4 py-2.5 rounded-lg text-white transition-colors text-sm font-medium cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            Создать проект
                          </button>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {/* {getStatusBadge(project.status)}
                    </div>
                  </div>
                </div>
                {/* <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Настройки
                  </Button>
                  <Button size="sm" className="gap-2">
                    <Play className="w-4 h-4" />
                    Запустить1
                  </Button>
                </div>
              </div> */}

              {/* Project Info Bar */}
              {/* <div className="flex items-center gap-4 text-sm mb-2">
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
              </div> */}

              {/* Navigation Tabs */}
              <div className="factory-tabs-container px-4 pb-2" ref={tabsRef}>
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
                  Журналы активности
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
          <div className="mx-auto px-4 pb-4 space-y-4">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
            <>

          {/* <div className="">
            <div
              className="hover:bg-muted/20 bg-muted/10  border rounded-2xl py-2 transition-shadow cursor-pointer"
              onClick={() => router.push(`/ai-studio/${projectId}/upload`)}
            >
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Референсы</h3>
                  </div>
                </div>
              </CardContent>
            </div>
          </div> */}

          {/* Publish Action */}
          {project.status === 'ready' && (
            <div className="border-primary/50 mt-4 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bell className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Контент готов к публикации</h3>
                      <p className="text-sm text-muted-foreground">
                        Опубликуйте контент на &nbsp;
                        <button onClick={() => router.push('/app/platforms')} className="underline hover:text-white transition-colors cursor-pointer">
                      подключенных платформах
                    </button>
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="gap-2"
                    onClick={() => router.push(`/ai-studio/${projectId}/publish`)}
                  >
                    <ArrowUpRightIcon className="w-4 h-4" />
                    Опубликовать
                  </Button>
                </div>
              </CardContent>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 mt-4 gap-4">
            <div className="hover:bg-muted/20 bg-muted/10 border rounded-2xl py-3 transition-shadow cursor-pointer" onClick={() => router.push(`/ai-studio/${projectId}/upload`)}>
              <CardContent>
                <h3 className="font-semibold ml-1.5">Референсы</h3>
                <p className="text-sm text-muted-foreground">Просмотр загруженных изображений</p>
              </CardContent>
            </div>
            <div className="hover:bg-muted/20 bg-muted/10 border rounded-2xl py-3 transition-shadow cursor-pointer" onClick={() => router.push(`/ai-studio/${projectId}/upload`)}>
              <CardContent>
                <h3 className="font-semibold ml-1.5">Генерация</h3>
                <p className="text-sm text-muted-foreground">Создать контент</p>
              </CardContent>
            </div>
            <div className="hover:bg-muted/20 bg-muted/10 border rounded-2xl py-3 transition-shadow cursor-pointer" onClick={() => router.push(`/ai-studio/${projectId}/upload`)}>
              <CardContent>
                <h3 className="font-semibold ml-1.5">Контент</h3>
                <p className="text-sm text-muted-foreground">Создать видео</p>
              </CardContent>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    onClick={() => router.push(`/ai-studio/${projectId}/upload`)}
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
                        {/* <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary text-xs">
                          {ref.fileType === 'video' ? '🎬' : ref.fileType === 'image' ? '🖼️' : '🎵'}
                        </div> */}
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
            </>
            )}

            {/* Deployments Tab */}
            {activeTab === 'deployments' && (
              <div className="space-y-4">
                {/* Filter Buttons */}
                <div className="flex gap-0 border-b border-border">
                  <button
                    onClick={() => setDeploymentsFilter('all')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      deploymentsFilter === 'all'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Все
                  </button>
                  <button
                    onClick={() => setDeploymentsFilter('posted')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      deploymentsFilter === 'posted'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Опубликованные
                  </button>
                  <button
                    onClick={() => setDeploymentsFilter('ready')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      deploymentsFilter === 'ready'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Готовые
                  </button>
                  <button
                    onClick={() => setDeploymentsFilter('generating')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      deploymentsFilter === 'generating'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    В процессе
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Генерации контента</h2>
                  <p className="text-muted-foreground">История всех генераций и их статус</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border rounded-xl p-4">
                    <CardDescription>Всего генераций</CardDescription>
                    <CardTitle className="text-3xl mt-2">{project.contentCount}</CardTitle>
                    <p className="text-xs mt-1">+12 за неделю</p>
                  </div>
                  <div className="border rounded-xl p-4">
                    <CardDescription>Опубликовано</CardDescription>
                    <CardTitle className="text-3xl mt-2">
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
                    <CardTitle className="text-3xl mt-2">
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
                      ]
                      .filter(d => deploymentsFilter === 'all' || d.status === deploymentsFilter)
                      .map((deployment, idx) => (
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
              <div className="space-y-4">

                {/* Filter Buttons */}
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
                <div className='bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-2 shadow-sm'>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {[
                        { time: '14:32', type: 'success', category: 'publish', message: 'Видео опубликовано в YouTube Shorts', detail: 'Обзор новой коллекции' },
                        { time: '14:30', type: 'info', category: 'generation', message: 'Генерация видео завершена', detail: 'GEN-156 • 45 сек' },
                        { time: '14:25', type: 'info', category: 'generation', message: 'Начата генерация видео из 30 изображений', detail: 'GEN-156' },
                        { time: '14:20', type: 'success', category: 'upload', message: 'Загружено 15 новых референсов', detail: '10 изображений, 5 видео' },
                        { time: '13:58', type: 'warning', category: 'generation', message: 'Анализ стиля завершен с предупреждениями', detail: 'Низкое качество 2 файлов' },
                        { time: '13:45', type: 'info', category: 'upload', message: 'Запущен анализ референсов', detail: 'Создание профиля стиля' },
                        { time: '12:30', type: 'error', category: 'error', message: 'Ошибка генерации: таймаут API', detail: 'GEN-153 • Повторная попытка' },
                        { time: '11:15', type: 'success', category: 'publish', message: 'Видео опубликовано в TikTok', detail: 'Топ-5 трендов сезона' },
                      ]
                      .filter(log => logFilter === 'all' || log.category === logFilter)
                      .map((log, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-2 hover:bg-muted/50 transition-colors">
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
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                {/* Filter Buttons */}
                <div className="flex gap-0 border-b border-border">
                  <button
                    onClick={() => setAnalyticsFilter('overview')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      analyticsFilter === 'overview'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Обзор
                  </button>
                  <button
                    onClick={() => setAnalyticsFilter('engagement')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      analyticsFilter === 'engagement'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Вовлеченность
                  </button>
                  <button
                    onClick={() => setAnalyticsFilter('platforms')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      analyticsFilter === 'platforms'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    По площадкам
                  </button>
                  <button
                    onClick={() => setAnalyticsFilter('content')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      analyticsFilter === 'content'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    По контенту
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Аналитика контента</h2>
                  <p className="text-muted-foreground">Метрики эффективности и вовлеченности</p>
                </div>

                {/* Metrics Grid */}
                {(analyticsFilter === 'overview' || analyticsFilter === 'engagement') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <CardDescription>Просмотры</CardDescription>
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-4xl">24.5K</CardTitle>
                      <p className="text-xs mt-2">↑ 32% за неделю</p>
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
                      <p className="text-xs mt-2">↑ 2.1% улучшение</p>
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
                      <p className="text-xs mt-2">↑ 18% рост</p>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-muted-foreground">YouTube: +680 • TikTok: +420</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Content */}
                {(analyticsFilter === 'overview' || analyticsFilter === 'content') && (
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
                                <p className="text-lg font-bold">{item.engagement}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Platform Analytics */}
                {analyticsFilter === 'platforms' && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Аналитика по площадкам</CardTitle>
                        <CardDescription>Эффективность каждой платформы</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { name: 'YouTube Shorts', icon: '🎬', views: '12.3K', engagement: '15.2%', subscribers: '+680', posts: 45, color: 'bg-red-500' },
                            { name: 'TikTok', icon: '🎵', views: '8.7K', engagement: '12.8%', subscribers: '+420', posts: 38, color: 'bg-purple-500' },
                            { name: 'Instagram Reels', icon: '📸', views: '5.4K', engagement: '10.5%', subscribers: '+180', posts: 28, color: 'bg-pink-500' },
                            { name: 'Pinterest', icon: '📌', views: '1.8K', engagement: '7.2%', subscribers: '+95', posts: 15, color: 'bg-orange-500' },
                          ].map((platform, idx) => (
                            <div key={idx} className="p-4 rounded-lg border">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="text-3xl">{platform.icon}</div>
                                  <div>
                                    <p className="font-medium">{platform.name}</p>
                                    <p className="text-sm text-muted-foreground">{platform.posts} публикаций</p>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">Просмотры</p>
                                  <p className="text-lg font-bold">{platform.views}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Вовлеченность</p>
                                  <p className="text-lg font-bold">{platform.engagement}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Подписчики</p>
                                  <p className="text-lg font-bold text-blue-500">{platform.subscribers}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* Speed Tab */}
            {activeTab === 'speed' && (
              <div className="space-y-4">
                {/* Filter Buttons */}
                <div className="flex gap-0 border-b border-border">
                  <button
                    onClick={() => setSpeedFilter('overview')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      speedFilter === 'overview'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Обзор
                  </button>
                  <button
                    onClick={() => setSpeedFilter('history')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      speedFilter === 'history'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    История
                  </button>
                  <button
                    onClick={() => setSpeedFilter('models')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      speedFilter === 'models'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    По моделям
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Производительность</h2>
                  <p className="text-muted-foreground">Скорость генерации и стабильность системы</p>
                </div>

                {/* Overview Filter */}
                {speedFilter === 'overview' && (
                  <>
                    {/* Speed Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <CardDescription>Среднее время генерации</CardDescription>
                          <Gauge className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-4xl">2.4s</CardTitle>
                        <p className="text-xs mt-2">↓ 15% быстрее</p>
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
                        <p className="text-xs mt-2">↑ 28% больше</p>
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
                        <p className="text-xs mt-2">Стабильно</p>
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-muted-foreground">Простой: 43 мин/месяц</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* History Filter */}
                {speedFilter === 'history' && (
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
                )}

                {/* Models Filter */}
                {speedFilter === 'models' && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Скорость по моделям</CardTitle>
                        <CardDescription>Производительность каждой AI модели</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { name: 'Stability AI SDXL', type: 'Изображения', avgTime: '1.2s', requests: 124, success: '99.2%' },
                            { name: 'Runway ML Gen-2', type: 'Видео', avgTime: '3.8s', requests: 48, success: '97.5%' },
                            { name: 'OpenAI GPT-4 Turbo', type: 'Текст', avgTime: '0.8s', requests: 87, success: '99.8%' },
                          ].map((model, idx) => (
                            <div key={idx} className="p-4 rounded-lg border">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="font-medium">{model.name}</p>
                                  <p className="text-sm text-muted-foreground">{model.type}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold">{model.avgTime}</p>
                                  <p className="text-xs text-muted-foreground">среднее время</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">Запросов</p>
                                  <p className="text-lg font-bold">{model.requests}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Успешность</p>
                                  <p className="text-lg font-bold">{model.success}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* AI Gateway Tab */}
            {activeTab === 'ai-gateway' && (
              <div className="space-y-4">
                {/* Filter Buttons */}
                <div className="flex gap-0 border-b border-border">
                  <button
                    onClick={() => setAiGatewayFilter('overview')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      aiGatewayFilter === 'overview'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Обзор
                  </button>
                  <button
                    onClick={() => setAiGatewayFilter('models')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      aiGatewayFilter === 'models'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Списки моделей
                  </button>
                  <button
                    onClick={() => setAiGatewayFilter('usage')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      aiGatewayFilter === 'usage'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Использование
                  </button>
                </div>

                {/* Overview Filter */}
                {aiGatewayFilter === 'overview' && (
                  <div className="space-y-4">

                    {/* Usage Stats */}
                    <div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Использование
                        </CardTitle>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Расходы по моделям</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">$0.00</div>
                            <p className="text-xs text-muted-foreground mt-1">Нет данных за выбранный период</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>P50 TTFT по моделям</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">0.00s</div>
                            <p className="text-xs text-muted-foreground mt-1">Нет данных за выбранный период</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Запросы по моделям</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground mt-1">Нет данных за выбранный период</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Все токены</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground mt-1">Нет данных за выбранный период</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button variant="outline">Запросы</Button>
                            <Button variant="outline">Сводка</Button>
                            <Button variant="outline">Лог</Button>
                            <Button variant="outline">Модели</Button>
                            <Button variant="outline">API ключи</Button>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Поиск..."
                              className="px-3 py-1.5 text-sm border rounded-lg bg-background"
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12">
                          <div className="text-muted-foreground mb-2">Нет данных</div>
                          <p className="text-sm text-muted-foreground">
                            Не найдено результатов за выбранный период
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* <div>
                      <CardTitle className="flex items-center gap-2">
                        Пример использования
                      </CardTitle>
                    </div>
                    <Card>
                      <CardContent>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                              <pre className="text-foreground">
{`import { streamText } from 'ai'

const result = streamText({
  model: 'openai/gpt-4o',
  prompt: 'Почему небо голубое?'
})`}
                              </pre>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                              <div className="w-5 h-5 rounded bg-blue-500/20"></div>
                              <span className="text-sm font-medium">OpenAI</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                              <div className="w-5 h-5 rounded bg-purple-500/20"></div>
                              <span className="text-sm font-medium">xAI</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                              <div className="w-5 h-5 rounded bg-orange-500/20"></div>
                              <span className="text-sm font-medium">Anthropic</span>
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card> */}

                  </div>
                )}

                {/* Models Filter */}
                {aiGatewayFilter === 'models' && (
                  <>
                    {/* AI Models Table */}
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Каталог AI моделей
                      </CardTitle>
                    </div>
                    <Card>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Провайдер</th>
                                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Модель</th>
                                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Тип</th>
                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Контекст</th>
                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Скорость</th>
                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Токены/с</th>
                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Ввод $/М</th>
                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Вывод $/М</th>
                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Кэширование</th>
                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Дата</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Google Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Google" />
                                </td>
                                <td className="p-3 font-medium">Gemini 2.5 Flash</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">1M</td>
                                <td className="p-3 text-right">0.6s</td>
                                <td className="p-3 text-right">175K</td>
                                <td className="p-3 text-right">$0.50</td>
                                <td className="p-3 text-right">$3.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.05</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">12/17/2025</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Google" />
                                </td>
                                <td className="p-3 font-medium">Gemini 2.5 Pro</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Рассуждение</Badge>
                                </td>
                                <td className="p-3 text-right">1M</td>
                                <td className="p-3 text-right">1.8s</td>
                                <td className="p-3 text-right">95K</td>
                                <td className="p-3 text-right">$2.50</td>
                                <td className="p-3 text-right">$12.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.25</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">12/17/2025</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Google" />
                                </td>
                                <td className="p-3 font-medium">Gemini 2.0 Flash</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">1M</td>
                                <td className="p-3 text-right">0.5s</td>
                                <td className="p-3 text-right">185K</td>
                                <td className="p-3 text-right">$0.30</td>
                                <td className="p-3 text-right">$1.50</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.03</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">02/05/2025</td>
                              </tr>

                              {/* OpenAI Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="OpenAI" />
                                </td>
                                <td className="p-3 font-medium">GPT-4o</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">128K</td>
                                <td className="p-3 text-right">0.7s</td>
                                <td className="p-3 text-right">145K</td>
                                <td className="p-3 text-right">$2.50</td>
                                <td className="p-3 text-right">$10.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.25</div>
                                  <div>Write: $1.25</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">05/13/2024</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="OpenAI" />
                                </td>
                                <td className="p-3 font-medium">GPT-4o Mini</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">128K</td>
                                <td className="p-3 text-right">0.4s</td>
                                <td className="p-3 text-right">195K</td>
                                <td className="p-3 text-right">$0.15</td>
                                <td className="p-3 text-right">$0.60</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.015</div>
                                  <div>Write: $0.06</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">07/18/2024</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="OpenAI" />
                                </td>
                                <td className="p-3 font-medium">o3</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Рассуждение</Badge>
                                </td>
                                <td className="p-3 text-right">200K</td>
                                <td className="p-3 text-right">2.5s</td>
                                <td className="p-3 text-right">65K</td>
                                <td className="p-3 text-right">$10.00</td>
                                <td className="p-3 text-right">$40.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $1.00</div>
                                  <div>Write: $5.00</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">04/16/2025</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="OpenAI" />
                                </td>
                                <td className="p-3 font-medium">o3 Mini</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Рассуждение</Badge>
                                </td>
                                <td className="p-3 text-right">200K</td>
                                <td className="p-3 text-right">1.5s</td>
                                <td className="p-3 text-right">95K</td>
                                <td className="p-3 text-right">$1.10</td>
                                <td className="p-3 text-right">$4.40</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.11</div>
                                  <div>Write: $0.55</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">01/31/2025</td>
                              </tr>

                              {/* Anthropic Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Anthropic" />
                                </td>
                                <td className="p-3 font-medium">Claude Sonnet 4.6</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">1M</td>
                                <td className="p-3 text-right">1.1s</td>
                                <td className="p-3 text-right">59K</td>
                                <td className="p-3 text-right">$3.00</td>
                                <td className="p-3 text-right">$15.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.30</div>
                                  <div>Write: $3.75</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">02/17/2026</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Anthropic" />
                                </td>
                                <td className="p-3 font-medium">Claude Opus 4.5</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Рассуждение</Badge>
                                </td>
                                <td className="p-3 text-right">1M</td>
                                <td className="p-3 text-right">2.8s</td>
                                <td className="p-3 text-right">42K</td>
                                <td className="p-3 text-right">$15.00</td>
                                <td className="p-3 text-right">$75.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $1.50</div>
                                  <div>Write: $18.75</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">01/24/2026</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Anthropic" />
                                </td>
                                <td className="p-3 font-medium">Claude Haiku 4.5</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">1M</td>
                                <td className="p-3 text-right">0.3s</td>
                                <td className="p-3 text-right">220K</td>
                                <td className="p-3 text-right">$0.80</td>
                                <td className="p-3 text-right">$4.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.08</div>
                                  <div>Write: $1.00</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">01/24/2026</td>
                              </tr>

                              {/* xAI Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="xAI" />
                                </td>
                                <td className="p-3 font-medium">Grok 4.1 Fast</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Рассуждение</Badge>
                                </td>
                                <td className="p-3 text-right">2M</td>
                                <td className="p-3 text-right">0.4s</td>
                                <td className="p-3 text-right">101K</td>
                                <td className="p-3 text-right">$0.20</td>
                                <td className="p-3 text-right">$0.50</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.05</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">07/09/2025</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="xAI" />
                                </td>
                                <td className="p-3 font-medium">Grok 4.1</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Рассуждение</Badge>
                                </td>
                                <td className="p-3 text-right">2M</td>
                                <td className="p-3 text-right">1.2s</td>
                                <td className="p-3 text-right">78K</td>
                                <td className="p-3 text-right">$3.00</td>
                                <td className="p-3 text-right">$15.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.30</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">07/09/2025</td>
                              </tr>

                              {/* Meta Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Meta" />
                                </td>
                                <td className="p-3 font-medium">Llama 4 Maverick</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">1M</td>
                                <td className="p-3 text-right">0.8s</td>
                                <td className="p-3 text-right">125K</td>
                                <td className="p-3 text-right">$0.25</td>
                                <td className="p-3 text-right">$1.25</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.025</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">04/05/2025</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Meta" />
                                </td>
                                <td className="p-3 font-medium">Llama 4 Scout</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">128K</td>
                                <td className="p-3 text-right">0.5s</td>
                                <td className="p-3 text-right">165K</td>
                                <td className="p-3 text-right">$0.10</td>
                                <td className="p-3 text-right">$0.50</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.01</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">04/05/2025</td>
                              </tr>

                              {/* Mistral Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Mistral" />
                                </td>
                                <td className="p-3 font-medium">Mistral Large 2</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">128K</td>
                                <td className="p-3 text-right">1.0s</td>
                                <td className="p-3 text-right">85K</td>
                                <td className="p-3 text-right">$2.00</td>
                                <td className="p-3 text-right">$6.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.20</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">07/24/2024</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Mistral" />
                                </td>
                                <td className="p-3 font-medium">Mistral Small 3</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">32K</td>
                                <td className="p-3 text-right">0.3s</td>
                                <td className="p-3 text-right">210K</td>
                                <td className="p-3 text-right">$0.10</td>
                                <td className="p-3 text-right">$0.30</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.01</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">01/30/2025</td>
                              </tr>

                              {/* Amazon Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Amazon" />
                                </td>
                                <td className="p-3 font-medium">Titan Embed Text V2</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Embeddings</Badge>
                                </td>
                                <td className="p-3 text-right">8K</td>
                                <td className="p-3 text-right">0.2s</td>
                                <td className="p-3 text-right">350K</td>
                                <td className="p-3 text-right">$0.10</td>
                                <td className="p-3 text-right">—</td>
                                <td className="p-3 text-right text-xs">
                                  <div>за 1K токенов</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">11/28/2023</td>
                              </tr>

                              {/* Xiaomi Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Xiaomi" />
                                </td>
                                <td className="p-3 font-medium">Mimo V2 Pro</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Мультимодальный</Badge>
                                </td>
                                <td className="p-3 text-right">1M</td>
                                <td className="p-3 text-right">1.4s</td>
                                <td className="p-3 text-right">68K</td>
                                <td className="p-3 text-right">$0.50</td>
                                <td className="p-3 text-right">$2.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.05</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">05/10/2025</td>
                              </tr>

                              {/* OpenAI Additional Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="OpenAI" />
                                </td>
                                <td className="p-3 font-medium">GPT Image 1.5</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Изображения</Badge>
                                </td>
                                <td className="p-3 text-right">—</td>
                                <td className="p-3 text-right">2.0s</td>
                                <td className="p-3 text-right">—</td>
                                <td className="p-3 text-right">$0.05</td>
                                <td className="p-3 text-right">—</td>
                                <td className="p-3 text-right text-xs">
                                  <div>за изображение</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">04/10/2025</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="OpenAI" />
                                </td>
                                <td className="p-3 font-medium">GPT-5 Chat</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">128K</td>
                                <td className="p-3 text-right">1.6s</td>
                                <td className="p-3 text-right">88K</td>
                                <td className="p-3 text-right">$5.00</td>
                                <td className="p-3 text-right">$20.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.50</div>
                                  <div>Write: $2.50</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">06/15/2025</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="OpenAI" />
                                </td>
                                <td className="p-3 font-medium">o4 Mini</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Рассуждение</Badge>
                                </td>
                                <td className="p-3 text-right">200K</td>
                                <td className="p-3 text-right">0.9s</td>
                                <td className="p-3 text-right">125K</td>
                                <td className="p-3 text-right">$1.10</td>
                                <td className="p-3 text-right">$4.40</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.11</div>
                                  <div>Write: $0.55</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">07/20/2025</td>
                              </tr>

                              {/* Google Additional Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Google" />
                                </td>
                                <td className="p-3 font-medium">Gemini Embedding 001</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Embeddings</Badge>
                                </td>
                                <td className="p-3 text-right">2K</td>
                                <td className="p-3 text-right">0.1s</td>
                                <td className="p-3 text-right">450K</td>
                                <td className="p-3 text-right">$0.05</td>
                                <td className="p-3 text-right">—</td>
                                <td className="p-3 text-right text-xs">
                                  <div>за 1K токенов</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">02/15/2024</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Google" />
                                </td>
                                <td className="p-3 font-medium">Gemini 3 Pro Image</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Изображения</Badge>
                                </td>
                                <td className="p-3 text-right">66K</td>
                                <td className="p-3 text-right">2.2s</td>
                                <td className="p-3 text-right">—</td>
                                <td className="p-3 text-right">$0.08</td>
                                <td className="p-3 text-right">—</td>
                                <td className="p-3 text-right text-xs">
                                  <div>за изображение</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">08/12/2025</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Google" />
                                </td>
                                <td className="p-3 font-medium">Gemma 4 26B A4B IT</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">262K</td>
                                <td className="p-3 text-right">0.6s</td>
                                <td className="p-3 text-right">155K</td>
                                <td className="p-3 text-right">$0.15</td>
                                <td className="p-3 text-right">$0.45</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.015</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">04/22/2025</td>
                              </tr>

                              {/* xAI Additional Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="xAI" />
                                </td>
                                <td className="p-3 font-medium">Grok 4.20 Non-Reasoning</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">2M</td>
                                <td className="p-3 text-right">0.5s</td>
                                <td className="p-3 text-right">165K</td>
                                <td className="p-3 text-right">$0.30</td>
                                <td className="p-3 text-right">$0.90</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.03</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">08/15/2025</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="xAI" />
                                </td>
                                <td className="p-3 font-medium">Grok 4</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">256K</td>
                                <td className="p-3 text-right">1.0s</td>
                                <td className="p-3 text-right">95K</td>
                                <td className="p-3 text-right">$2.00</td>
                                <td className="p-3 text-right">$8.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.20</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">06/01/2025</td>
                              </tr>

                              {/* Mistral Additional Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Mistral" />
                                </td>
                                <td className="p-3 font-medium">Mistral Embed</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Embeddings</Badge>
                                </td>
                                <td className="p-3 text-right">8K</td>
                                <td className="p-3 text-right">0.1s</td>
                                <td className="p-3 text-right">520K</td>
                                <td className="p-3 text-right">$0.10</td>
                                <td className="p-3 text-right">—</td>
                                <td className="p-3 text-right text-xs">
                                  <div>за 1K токенов</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">09/15/2023</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Mistral" />
                                </td>
                                <td className="p-3 font-medium">Mistral Large 3</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">256K</td>
                                <td className="p-3 text-right">1.2s</td>
                                <td className="p-3 text-right">78K</td>
                                <td className="p-3 text-right">$2.00</td>
                                <td className="p-3 text-right">$6.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.20</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">09/18/2025</td>
                              </tr>

                              {/* Anthropic Additional Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Anthropic" />
                                </td>
                                <td className="p-3 font-medium">Claude 3.5 Haiku</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">200K</td>
                                <td className="p-3 text-right">0.4s</td>
                                <td className="p-3 text-right">195K</td>
                                <td className="p-3 text-right">$0.80</td>
                                <td className="p-3 text-right">$4.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.08</div>
                                  <div>Write: $1.00</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">07/15/2024</td>
                              </tr>

                              {/* Perplexity Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Perplexity" />
                                </td>
                                <td className="p-3 font-medium">Sonar</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Поиск</Badge>
                                </td>
                                <td className="p-3 text-right">127K</td>
                                <td className="p-3 text-right">1.1s</td>
                                <td className="p-3 text-right">92K</td>
                                <td className="p-3 text-right">$1.00</td>
                                <td className="p-3 text-right">$1.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>за запрос</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">03/28/2024</td>
                              </tr>

                              {/* DeepSeek Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="DeepSeek" />
                                </td>
                                <td className="p-3 font-medium">DeepSeek V3</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">164K</td>
                                <td className="p-3 text-right">1.0s</td>
                                <td className="p-3 text-right">95K</td>
                                <td className="p-3 text-right">$0.27</td>
                                <td className="p-3 text-right">$1.10</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.027</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">12/26/2024</td>
                              </tr>

                              {/* NVIDIA Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="NVIDIA" />
                                </td>
                                <td className="p-3 font-medium">Nemotron 3 Nano 30B A3B</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">262K</td>
                                <td className="p-3 text-right">0.6s</td>
                                <td className="p-3 text-right">155K</td>
                                <td className="p-3 text-right">$0.20</td>
                                <td className="p-3 text-right">$0.60</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.02</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">09/10/2025</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="NVIDIA" />
                                </td>
                                <td className="p-3 font-medium">Nemotron 3 Super 120B A12B</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">256K</td>
                                <td className="p-3 text-right">1.4s</td>
                                <td className="p-3 text-right">68K</td>
                                <td className="p-3 text-right">$1.00</td>
                                <td className="p-3 text-right">$3.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.10</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">09/10/2025</td>
                              </tr>

                              {/* DeepSeek Additional Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="DeepSeek" />
                                </td>
                                <td className="p-3 font-medium">DeepSeek V3.1</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">164K</td>
                                <td className="p-3 text-right">0.9s</td>
                                <td className="p-3 text-right">105K</td>
                                <td className="p-3 text-right">$0.30</td>
                                <td className="p-3 text-right">$1.20</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.03</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">10/15/2025</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="DeepSeek" />
                                </td>
                                <td className="p-3 font-medium">DeepSeek V3.1 Terminus</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">131K</td>
                                <td className="p-3 text-right">1.1s</td>
                                <td className="p-3 text-right">85K</td>
                                <td className="p-3 text-right">$0.35</td>
                                <td className="p-3 text-right">$1.40</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.035</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">11/01/2025</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="DeepSeek" />
                                </td>
                                <td className="p-3 font-medium">DeepSeek R1</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Рассуждение</Badge>
                                </td>
                                <td className="p-3 text-right">160K</td>
                                <td className="p-3 text-right">2.0s</td>
                                <td className="p-3 text-right">55K</td>
                                <td className="p-3 text-right">$0.55</td>
                                <td className="p-3 text-right">$2.20</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.055</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">01/20/2025</td>
                              </tr>

                              {/* Anthropic Additional Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Anthropic" />
                                </td>
                                <td className="p-3 font-medium">Claude Opus 4.1</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Рассуждение</Badge>
                                </td>
                                <td className="p-3 text-right">200K</td>
                                <td className="p-3 text-right">3.2s</td>
                                <td className="p-3 text-right">38K</td>
                                <td className="p-3 text-right">$18.00</td>
                                <td className="p-3 text-right">$90.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $1.80</div>
                                  <div>Write: $22.50</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">05/20/2025</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Anthropic" />
                                </td>
                                <td className="p-3 font-medium">Claude Opus 4</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Рассуждение</Badge>
                                </td>
                                <td className="p-3 text-right">200K</td>
                                <td className="p-3 text-right">3.5s</td>
                                <td className="p-3 text-right">35K</td>
                                <td className="p-3 text-right">$15.00</td>
                                <td className="p-3 text-right">$75.00</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $1.50</div>
                                  <div>Write: $18.75</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">03/04/2024</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Anthropic" />
                                </td>
                                <td className="p-3 font-medium">Claude 3 Haiku</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">200K</td>
                                <td className="p-3 text-right">0.3s</td>
                                <td className="p-3 text-right">230K</td>
                                <td className="p-3 text-right">$0.25</td>
                                <td className="p-3 text-right">$1.25</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.025</div>
                                  <div>Write: $0.31</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">03/13/2024</td>
                              </tr>

                              {/* Amazon Additional Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Amazon" />
                                </td>
                                <td className="p-3 font-medium">Nova Lite</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">300K</td>
                                <td className="p-3 text-right">0.5s</td>
                                <td className="p-3 text-right">175K</td>
                                <td className="p-3 text-right">$0.15</td>
                                <td className="p-3 text-right">$0.45</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.015</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">04/08/2025</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Amazon" />
                                </td>
                                <td className="p-3 font-medium">Nova 2 Lite</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">1M</td>
                                <td className="p-3 text-right">0.6s</td>
                                <td className="p-3 text-right">165K</td>
                                <td className="p-3 text-right">$0.20</td>
                                <td className="p-3 text-right">$0.60</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.02</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">10/20/2025</td>
                              </tr>

                              {/* OpenAI Additional Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="OpenAI" />
                                </td>
                                <td className="p-3 font-medium">GPT-3.5 Turbo</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">16K</td>
                                <td className="p-3 text-right">0.2s</td>
                                <td className="p-3 text-right">280K</td>
                                <td className="p-3 text-right">$0.50</td>
                                <td className="p-3 text-right">$1.50</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.05</div>
                                  <div>Write: $0.15</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">03/01/2023</td>
                              </tr>

                              {/* xAI Additional Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="xAI" />
                                </td>
                                <td className="p-3 font-medium">Grok 4.20 Multi-Agent</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Мульти-агент</Badge>
                                </td>
                                <td className="p-3 text-right">2M</td>
                                <td className="p-3 text-right">1.3s</td>
                                <td className="p-3 text-right">75K</td>
                                <td className="p-3 text-right">$0.50</td>
                                <td className="p-3 text-right">$1.50</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.05</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">09/01/2025</td>
                              </tr>

                              {/* Mistral Additional Models */}
                              <tr className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <ProviderLogo provider="Mistral" />
                                </td>
                                <td className="p-3 font-medium">Mistral Medium</td>
                                <td className="p-3">
                                  <Badge variant="secondary">Генерация</Badge>
                                </td>
                                <td className="p-3 text-right">128K</td>
                                <td className="p-3 text-right">1.1s</td>
                                <td className="p-3 text-right">85K</td>
                                <td className="p-3 text-right">$2.75</td>
                                <td className="p-3 text-right">$8.25</td>
                                <td className="p-3 text-right text-xs">
                                  <div>Read: $0.275</div>
                                  <div>Write: —</div>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">09/15/2024</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Model Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Настройки моделей</CardTitle>
                        <CardDescription>Конфигурация параметров генерации</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Качество изображений</p>
                            <p className="text-sm text-muted-foreground">Высокое (1024x1024)</p>
                          </div>
                          <Button variant="outline" size="sm">Изменить</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Качество видео</p>
                            <p className="text-sm text-muted-foreground">HD (1920x1080)</p>
                          </div>
                          <Button variant="outline" size="sm">Изменить</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Температура генерации</p>
                            <p className="text-sm text-muted-foreground">0.7 (сбалансировано)</p>
                          </div>
                          <Button variant="outline" size="sm">Настроить</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Usage Filter */}
                {aiGatewayFilter === 'usage' && (
                  <div className="space-y-4">
                    {/* Usage Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-xl p-6">
                        <CardDescription className="mb-2">Всего запросов</CardDescription>
                        <CardTitle className="text-4xl mb-2">259</CardTitle>
                        <p className="text-xs">↑ 28% за неделю</p>
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-muted-foreground">Сегодня: 127 запросов</p>
                        </div>
                      </div>

                      <div className="border rounded-xl p-6">
                        <CardDescription className="mb-2">Кредиты использовано</CardDescription>
                        <CardTitle className="text-4xl mb-2">840</CardTitle>
                        <p className="text-xs text-muted-foreground">Из 5000</p>
                        <div className="mt-4 pt-4 border-t">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '17%' }} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Использовано 17%</p>
                        </div>
                      </div>

                      <div className="border rounded-xl p-6">
                        <CardDescription className="mb-2">Среднее время ответа</CardDescription>
                        <CardTitle className="text-4xl mb-2">1.9s</CardTitle>
                        <p className="text-xs">↓ 15% быстрее</p>
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-muted-foreground">Пик: 3.2s • Мин: 0.4s</p>
                        </div>
                      </div>
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

                    {/* Usage History */}
                    <Card>
                      <CardHeader>
                        <CardTitle>История использования</CardTitle>
                        <CardDescription>Активность за последние 7 дней</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { day: 'Пн', requests: 45, credits: 142, avgTime: '2.1s' },
                            { day: 'Вт', requests: 52, credits: 168, avgTime: '1.9s' },
                            { day: 'Ср', requests: 48, credits: 155, avgTime: '2.0s' },
                            { day: 'Чт', requests: 61, credits: 195, avgTime: '1.8s' },
                            { day: 'Пт', requests: 55, credits: 178, avgTime: '1.7s' },
                            { day: 'Сб', requests: 38, credits: 122, avgTime: '2.2s' },
                            { day: 'Вс', requests: 43, credits: 138, avgTime: '2.0s' },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="w-12 font-medium">{item.day}</div>
                              <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-xs text-muted-foreground">Запросов</p>
                                  <p className="font-bold">{item.requests}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Кредитов</p>
                                  <p className="font-bold">{item.credits}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Ср. время</p>
                                  <p className="font-bold">{item.avgTime}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* Usage Tab */}
            {activeTab === 'usage' && (
              <div className="space-y-4">
                {/* Filter Buttons */}
                <div className="flex gap-0 border-b border-border">
                  <button
                    onClick={() => setUsageFilter('overview')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      usageFilter === 'overview'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Обзор
                  </button>
                  <button
                    onClick={() => setUsageFilter('credits')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      usageFilter === 'credits'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Кредиты
                  </button>
                  <button
                    onClick={() => setUsageFilter('storage')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      usageFilter === 'storage'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Хранилище
                  </button>
                  <button
                    onClick={() => setUsageFilter('history')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      usageFilter === 'history'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    История
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Использование ресурсов</h2>
                  <p className="text-muted-foreground">Статистика потребления и лимиты</p>
                </div>

                {/* Overview Filter */}
                {usageFilter === 'overview' && (
                  <>
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
                  </>
                )}

                {/* Credits Filter */}
                {usageFilter === 'credits' && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Баланс кредитов</CardTitle>
                        <CardDescription>Детальная информация о кредитах</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground mb-2">Доступно кредитов</p>
                          <p className="text-6xl font-bold mb-4">3,760</p>
                          <p className="text-sm text-muted-foreground">Из 5,000</p>
                          <div className="mt-6 w-full max-w-md mx-auto">
                            <div className="w-full bg-muted rounded-full h-4">
                              <div className="bg-primary h-4 rounded-full" style={{ width: '25%' }} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Использовано 1,240 (25%)</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Расход по типам</CardTitle>
                        <CardDescription>Распределение кредитов за месяц</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { type: 'Генерация видео', model: 'Runway ML', credits: 680, percentage: 55, icon: Video },
                            { type: 'Генерация изображений', model: 'Stability AI', credits: 420, percentage: 34, icon: Sparkles },
                            { type: 'Генерация сценариев', model: 'OpenAI GPT-4', credits: 140, percentage: 11, icon: FileText },
                          ].map((item, idx) => (
                            <div key={idx} className="p-4 rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <item.icon className="w-5 h-5 text-primary" />
                                  <div>
                                    <p className="font-medium">{item.type}</p>
                                    <p className="text-sm text-muted-foreground">{item.model}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold">{item.credits}</p>
                                  <p className="text-xs text-muted-foreground">кредитов</p>
                                </div>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Пополнение кредитов</CardTitle>
                        <CardDescription>История покупок</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { date: '15 апр 2026', amount: '+5,000', type: 'План Pro' },
                            { date: '15 мар 2026', amount: '+5,000', type: 'План Pro' },
                            { date: '15 фев 2026', amount: '+5,000', type: 'План Pro' },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                              <div>
                                <p className="font-medium">{item.type}</p>
                                <p className="text-sm text-muted-foreground">{item.date}</p>
                              </div>
                              <p className="text-lg font-bold">{item.amount}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Storage Filter */}
                {usageFilter === 'storage' && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Использование хранилища</CardTitle>
                        <CardDescription>Распределение дискового пространства</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground mb-2">Использовано</p>
                          <p className="text-6xl font-bold mb-4">2.4 GB</p>
                          <p className="text-sm text-muted-foreground">Из 10 GB</p>
                          <div className="mt-6 w-full max-w-md mx-auto">
                            <div className="w-full bg-muted rounded-full h-4">
                              <div className="bg-blue-500 h-4 rounded-full" style={{ width: '24%' }} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Доступно 7.6 GB</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Детализация хранилища</CardTitle>
                        <CardDescription>Распределение по типам файлов</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { type: 'Референсы (изображения)', size: '850 MB', files: 156, percentage: 35 },
                            { type: 'Референсы (видео)', size: '1.2 GB', files: 28, percentage: 50 },
                            { type: 'Сгенерированный контент', size: '280 MB', files: 48, percentage: 12 },
                            { type: 'Другое', size: '70 MB', files: 12, percentage: 3 },
                          ].map((item, idx) => (
                            <div key={idx} className="p-4 rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium">{item.type}</p>
                                  <p className="text-sm text-muted-foreground">{item.files} файлов</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold">{item.size}</p>
                                  <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                                </div>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Управление хранилищем</CardTitle>
                        <CardDescription>Опции очистки и расширения</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Очистить кэш</p>
                            <p className="text-sm text-muted-foreground">Удалить временные файлы (120 MB)</p>
                          </div>
                          <Button variant="outline" size="sm">Очистить</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Удалить старые генерации</p>
                            <p className="text-sm text-muted-foreground">Файлы старше 30 дней (450 MB)</p>
                          </div>
                          <Button variant="outline" size="sm">Удалить</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Расширить хранилище</p>
                            <p className="text-sm text-muted-foreground">Дополнительные 50 GB за $5/мес</p>
                          </div>
                          <Button variant="outline" size="sm">Расширить</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* History Filter */}
                {usageFilter === 'history' && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>История использования</CardTitle>
                        <CardDescription>Активность за последние 7 дней</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { date: '17 апр', credits: 142, storage: '+45 MB', api: 67 },
                            { date: '16 апр', credits: 168, storage: '+52 MB', api: 78 },
                            { date: '15 апр', credits: 155, storage: '+38 MB', api: 72 },
                            { date: '14 апр', credits: 195, storage: '+68 MB', api: 89 },
                            { date: '13 апр', credits: 178, storage: '+55 MB', api: 82 },
                            { date: '12 апр', credits: 122, storage: '+32 MB', api: 56 },
                            { date: '11 апр', credits: 138, storage: '+41 MB', api: 64 },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="w-20 font-medium">{item.date}</div>
                              <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-xs text-muted-foreground">Кредиты</p>
                                  <p className="font-bold">{item.credits}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Хранилище</p>
                                  <p className="font-bold text-blue-500">{item.storage}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">API</p>
                                  <p className="font-bold">{item.api} запросов</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-4">

                {/* Filter Buttons */}
                <div className="flex gap-0 border-b border-border">
                  <button
                    onClick={() => setSettingsFilter('general')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      settingsFilter === 'general'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Общие
                  </button>
                  <button
                    onClick={() => setSettingsFilter('security')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      settingsFilter === 'security'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Безопасность
                  </button>
                  <button
                    onClick={() => setSettingsFilter('content')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      settingsFilter === 'content'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Контент
                  </button>
                  <button
                    onClick={() => setSettingsFilter('platforms')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      settingsFilter === 'platforms'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Площадки
                  </button>
                  <button
                    onClick={() => setSettingsFilter('publishing')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      settingsFilter === 'publishing'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Публикация
                  </button>
                  <button
                    onClick={() => setSettingsFilter('advanced')}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      settingsFilter === 'advanced'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Расширенные
                  </button>
                </div>

                {/* General Settings */}
                {settingsFilter === 'general' && (
                  <div className="space-y-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Основная информация
                      </CardTitle>
                    </div>
                    <Card>
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
                            <p className="font-medium">Описание</p>
                            <p className="text-sm text-muted-foreground">{project.description || 'Нет описания'}</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Edit className="w-4 h-4" />
                            Редактировать
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Дата создания</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(project.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Последнее обновление</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(project.updatedAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Настройки видео
                      </CardTitle>
                    </div>
                    <Card>
                      <CardContent className="space-y-4">
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
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Целевые площадки</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {project.settings?.targetPlatforms?.map((platform) => (
                                <div key={platform} className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted">
                                  <span className="text-sm">{platform}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Edit className="w-4 h-4" />
                            Изменить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Security Settings */}
                {settingsFilter === 'security' && (
                  <div className="space-y-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Доступ и разрешения
                      </CardTitle>
                    </div>
                    <Card>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Видимость проекта</p>
                            <p className="text-sm text-muted-foreground">Приватный (только вы)</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="w-4 h-4" />
                            Изменить
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Совместный доступ</p>
                            <p className="text-sm text-muted-foreground">Нет подключенных пользователей</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Users className="w-4 h-4" />
                            Пригласить
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">API доступ</p>
                            <p className="text-sm text-muted-foreground">Включен</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Key className="w-4 h-4" />
                            Настроить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Защита данных
                      </CardTitle>
                    </div>
                    <Card>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Резервное копирование</p>
                            <p className="text-sm text-muted-foreground">Автоматическое (каждые 24 часа)</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Скачать
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Журнал действий</p>
                            <p className="text-sm text-muted-foreground">Ведется</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <FileText className="w-4 h-4" />
                            Просмотр
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Двухфакторная аутентификация</p>
                            <p className="text-sm text-muted-foreground">Включена для аккаунта</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Shield className="w-4 h-4" />
                            Настроить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Content Settings */}
                {settingsFilter === 'content' && (
                  <div className="space-y-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Профиль стиля
                      </CardTitle>
                    </div>
                    <Card>
                      <CardContent className="space-y-4">
                        {project.styleProfile ? (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-lg border">
                                <p className="text-sm text-muted-foreground">Настроение</p>
                                <p className="font-medium capitalize">{project.styleProfile.mood}</p>
                              </div>
                              <div className="p-4 rounded-lg border">
                                <p className="text-sm text-muted-foreground">Темп</p>
                                <p className="font-medium capitalize">{project.styleProfile.tempo}</p>
                              </div>
                              <div className="p-4 rounded-lg border">
                                <p className="text-sm text-muted-foreground">Стиль музыки</p>
                                <p className="font-medium">{project.styleProfile.musicStyle || '-'}</p>
                              </div>
                              <div className="p-4 rounded-lg border">
                                <p className="text-sm text-muted-foreground">Визуальный стиль</p>
                                <p className="font-medium">{project.styleProfile.visualStyle || '-'}</p>
                              </div>
                            </div>
                            <div className="p-4 rounded-lg border">
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
                            <Button variant="outline" className="w-full gap-2">
                              <RotateCcw className="w-4 h-4" />
                              Переанализировать референсы
                            </Button>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground">Профиль стиля еще не создан</p>
                            <p className="text-sm text-muted-foreground mt-2">Загрузите референсы и запустите анализ</p>
                            <Button className="mt-4" onClick={() => router.push(`/ai-studio/${projectId}/upload`)}>
                              Загрузить референсы
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Референсы
                      </CardTitle>
                    </div>
                    <Card>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Всего референсов</p>
                            <p className="text-sm text-muted-foreground">{project.referenceCount} файлов</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Upload className="w-4 h-4" />
                            Загрузить еще
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Проанализировано</p>
                            <p className="text-sm text-muted-foreground">{project.referenceCount} из {project.referenceCount}</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Settings className="w-4 h-4" />
                            Переанализировать
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Platforms Settings */}
                {settingsFilter === 'platforms' && (
                  <div className="space-y-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Подключенные площадки
                      </CardTitle>
                    </div>
                    <Card>
                      <CardContent>
                        <div className="gap-2">
                          {[
                            { name: 'YouTube Shorts' },
                            { name: 'TikTok' },
                            { name: 'Instagram Reels' },
                            { name: 'Pinterest'},
                          ].map((platform, idx) => (
                            <Button variant="outline" size="sm" className="gap-2">
                              {platform.name}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Статистика площадок
                      </CardTitle>
                    </div>
                    <Card>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg border">
                            <p className="text-sm text-muted-foreground">Всего подключено</p>
                            <p className="text-2xl font-bold mt-1">4</p>
                          </div>
                          <div className="p-4 rounded-lg border">
                            <p className="text-sm text-muted-foreground">Активных</p>
                            <p className="text-2xl font-bold mt-1">3</p>
                          </div>
                          <div className="p-4 rounded-lg border">
                            <p className="text-sm text-muted-foreground">Всего постов</p>
                            <p className="text-2xl font-bold mt-1">126</p>
                          </div>
                          <div className="p-4 rounded-lg border">
                            <p className="text-sm text-muted-foreground">Общий охват</p>
                            <p className="text-2xl font-bold mt-1">28.5K</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Publishing Settings */}
                {settingsFilter === 'publishing' && (
                  <div className="space-y-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Расписание публикации
                      </CardTitle>
                    </div>
                    <Card>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Автоматическая публикация</p>
                            <p className="text-sm text-muted-foreground">Отключена</p>
                          </div>
                          <Button variant="outline" size="sm">Включить</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Частота публикации</p>
                            <p className="text-sm text-muted-foreground">Ежедневно</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Edit className="w-4 h-4" />
                            Изменить
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Время публикации</p>
                            <p className="text-sm text-muted-foreground">09:00 (МСК)</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Clock className="w-4 h-4" />
                            Настроить
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Дни публикации</p>
                            <p className="text-sm text-muted-foreground">Пн, Вт, Ср, Чт, Пт</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Calendar className="w-4 h-4" />
                            Выбрать дни
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Параметры публикации
                      </CardTitle>
                    </div>
                    <Card>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Авто-хэштеги</p>
                            <p className="text-sm text-muted-foreground">Автоматическая генерация хэштегов</p>
                          </div>
                          <Button variant="outline" size="sm">Включено</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Авто-описание</p>
                            <p className="text-sm text-muted-foreground">Генерация описания через ИИ</p>
                          </div>
                          <Button variant="outline" size="sm">Включено</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Уведомления о публикации</p>
                            <p className="text-sm text-muted-foreground">Уведомлять после каждой публикации</p>
                          </div>
                          <Button variant="outline" size="sm">Включено</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsFilter === 'advanced' && (
                  <div className="space-y-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Вебхуки и интеграции
                      </CardTitle>
                    </div>
                    <Card>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">n8n Webhook URL</p>
                              <code className="text-xs bg-muted p-2 rounded block mt-2">
                                https://your-domain.com/api/factory/webhook/n8n
                              </code>
                            </div>
                            <Button variant="outline" size="sm">Копировать</Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Используйте этот URL для интеграции с n8n
                          </p>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">API Key</p>
                            <p className="text-sm text-muted-foreground">••••••••••••••••</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Показать</Button>
                            <Button variant="outline" size="sm">Сгенерировать</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Данные проекта
                      </CardTitle>
                    </div>
                    <Card>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Экспорт данных</p>
                            <p className="text-sm text-muted-foreground">Скачать все данные проекта</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Экспорт
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Импорт данных</p>
                            <p className="text-sm text-muted-foreground">Загрузить данные из файла</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Upload className="w-4 h-4" />
                            Импорт
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <div>
                      <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                        Опасная зона
                      </CardTitle>
                    </div>
                    <Card className="border-red-200 dark:border-red-800">
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
            )}
          </div>
        </div>
      // </div>
  );
}
