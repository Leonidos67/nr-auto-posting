'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Plus,
  Check,
  X,
  Settings,
  ExternalLink,
  AlertCircle,
  Loader2,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { YouTubeIcon, TikTokIcon, InstagramIcon, PinterestIcon, TelegramIcon, VKIcon } from '@/components/social-icons';

interface ConnectedPlatform {
  _id: string;
  id?: string;
  platform: string;
  accountName: string;
  accountAvatar?: string;
  status: 'connected' | 'error' | 'pending';
  connectedAt: string;
  lastPosted?: string;
  postsCount: number;
}

interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'password' | 'url';
    placeholder: string;
  }[];
}

export default function PlatformsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchConnectedPlatforms();
    }
  }, [user]);

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

  const platforms: PlatformConfig[] = [
    {
      id: 'youtube-shorts',
      name: 'YouTube',
      icon: 'youtube',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Введите API ключ YouTube' },
        { name: 'channelId', label: 'Channel ID', type: 'text', placeholder: 'UCxxxxxxxxxxxxxxxxxxxxxx' },
      ],
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: 'tiktok',
      fields: [
        { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Введите Access Token' },
        { name: 'openId', label: 'Open ID', type: 'text', placeholder: 'Введите Open ID' },
      ],
    },
    {
      id: 'instagram-reels',
      name: 'Instagram',
      icon: 'instagram',
      fields: [
        { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Instagram Access Token' },
        { name: 'accountId', label: 'Account ID', type: 'text', placeholder: 'Instagram Business Account ID' },
      ],
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: 'pinterest',
      fields: [
        { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Pinterest Access Token' },
        { name: 'boardId', label: 'Board ID', type: 'text', placeholder: 'ID доски для публикаций' },
      ],
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: 'telegram',
      fields: [
        { name: 'botToken', label: 'Bot Token', type: 'password', placeholder: '1234567890:ABC...' },
        { name: 'channelId', label: 'Channel ID', type: 'text', placeholder: '@channelname или -100xxxxxxxxxx' },
      ],
    },
    {
      id: 'vk',
      name: 'VK',
      icon: 'vk',
      fields: [
        { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'VK Access Token' },
        { name: 'groupId', label: 'Group ID', type: 'text', placeholder: 'ID группы (без @)' },
      ],
    },
  ];

  // Фильтрация платформ по поисковому запросу
  const filteredPlatforms = platforms.filter(platform =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = async () => {
    if (!selectedPlatform) return;

    setConnecting(true);
    
    try {
      const response = await fetch('/api/platforms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: selectedPlatform.id,
          ...formData,
        }),
      });

      if (response.ok) {
        await fetchConnectedPlatforms();
        setSelectedPlatform(null);
        setFormData({});
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка подключения');
      }
    } catch (error) {
      console.error('Error connecting platform:', error);
      alert('Ошибка подключения');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    if (!confirm('Отключить эту площадку?')) return;

    try {
      const response = await fetch(`/api/platforms/${platformId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchConnectedPlatforms();
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка отключения площадки');
      }
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      alert('Ошибка отключения площадки');
    }
  };

  const isConnected = (platformId: string) => {
    return connectedPlatforms.some(p => p.platform === platformId && p.status === 'connected');
  };

  const renderIcon = (iconName: string, className: string = "w-6 h-6") => {
    switch (iconName) {
      case 'youtube':
        return <YouTubeIcon className={className} />;
      case 'tiktok':
        return <TikTokIcon className={className} />;
      case 'instagram':
        return <InstagramIcon className={className} />;
      case 'pinterest':
        return <PinterestIcon className={className} />;
      case 'telegram':
        return <TelegramIcon className={className} />;
      case 'vk':
        return <VKIcon className={className} />;
      default:
        return null;
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
              <h1 className="text-lg font-bold">Подключенные площадки</h1>
              <div className='flex gap-2'>
                <Badge variant="secondary" className="text-sm">
                  Подключено: {connectedPlatforms.filter(p => p.status === 'connected').length}
                </Badge>
              </div>
            </div>

          <div className="rounded-xl bg-muted/50">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ваши площадки</span>
              </div>
            </div>
            <div className="p-4">
              {connectedPlatforms.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div>
                    <p className="text-md text-muted-foreground">У вас нет подключенных площадок</p>
                    <p className="text-xs text-muted-foreground">
                      Подключите хотя бы одну социальную сеть для начала работы.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectedPlatforms.map((platform) => {
                    const config = platforms.find(p => p.id === platform.platform);
                    const platformId = platform._id || platform.id;
                    return (
                      <div
                        key={platformId}
                        className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg`}>
                            {config && renderIcon(config.icon, "w-6 h-6 text-white")}
                          </div>
                          <div>
                            <p className="font-medium">{config?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {platform.postsCount} публикаций
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              {platform.status === 'connected' && (
                                <Badge className="bg-white">
                                  <Check className="w-3 h-3 mr-1" />
                                  Подключено
                                </Badge>
                              )}
                              {platform.status === 'error' && (
                                <Badge variant="destructive">
                                  <X className="w-3 h-3 mr-1" />
                                  Ошибка
                                </Badge>
                              )}
                              {platform.status === 'pending' && (
                                <Badge variant="secondary">
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Ожидание
                                </Badge>
                              )}
                            </div>
                          </div>
                          {platformId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDisconnect(platformId)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Available Platforms */}
          <div className='rounded-xl'>
            <div className="pb-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Доступные площадки (6)</span>
              </div>
              
              {/* Search Input */}
              <div className="relative rounded-3xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="поиск..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 max-w-max pr-4 rounded-3xl cursor-default"
                />
              </div>
            </div>
            
            <div className="p-0">
              {filteredPlatforms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Площадка "{searchQuery}" не найдена
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredPlatforms.map((platform) => {
                    const connected = isConnected(platform.id);
                    return (
                      <div
                        key={platform.id}
                        className={`relative rounded-none border-b border-white/5 p-2 transition-all ${
                          connected ? 'bg-muted/20 border-primary/50' : 'hover:border-primary/50'
                        }`}
                      > 
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                              {renderIcon(platform.icon)}
                            </div>
                            <h3 className="font-semibold text-sm">{platform.name}</h3>
                          </div>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                className="gap-2 cursor-pointer" 
                                disabled={connected}
                                onClick={() => setSelectedPlatform(platform)}
                              >
                                {connected ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4" />
                                  </>
                                )}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <div className="w-8 h-8">
                                    {selectedPlatform && renderIcon(selectedPlatform.icon, "w-8 h-8")}
                                  </div>
                                  Подключить {selectedPlatform?.name}
                                </DialogTitle>
                                <DialogDescription>
                                  Введите данные для подключения к {platform.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                {platform.fields.map((field) => (
                                  <div key={field.name} className="space-y-2">
                                    <Label htmlFor={field.name}>{field.label}</Label>
                                    <Input
                                      id={field.name}
                                      type={field.type}
                                      placeholder={field.placeholder}
                                      value={formData[field.name] || ''}
                                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                    />
                                  </div>
                                ))}
                                <div className="flex gap-2 pt-4">
                                  <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                      setSelectedPlatform(null);
                                      setFormData({});
                                    }}
                                  >
                                    Отмена
                                  </Button>
                                  <Button
                                    className="flex-1 gap-2"
                                    onClick={handleConnect}
                                    disabled={connecting}
                                  >
                                    {connecting ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Подключение...
                                      </>
                                    ) : (
                                      <>
                                        <ExternalLink className="w-4 h-4" />
                                        Подключить
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}