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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  color: string;
  description: string;
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
      name: 'YouTube Shorts',
      icon: '🎬',
      color: 'bg-red-500',
      description: 'Короткие вертикальные видео до 60 секунд',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Введите API ключ YouTube' },
        { name: 'channelId', label: 'Channel ID', type: 'text', placeholder: 'UCxxxxxxxxxxxxxxxxxxxxxx' },
      ],
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      color: 'bg-black',
      description: 'Короткие видео с музыкой и эффектами',
      fields: [
        { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Введите Access Token' },
        { name: 'openId', label: 'Open ID', type: 'text', placeholder: 'Введите Open ID' },
      ],
    },
    {
      id: 'instagram-reels',
      name: 'Instagram Reels',
      icon: '📸',
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      description: 'Видео до 90 секунд с музыкой',
      fields: [
        { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Instagram Access Token' },
        { name: 'accountId', label: 'Account ID', type: 'text', placeholder: 'Instagram Business Account ID' },
      ],
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: '📌',
      color: 'bg-red-600',
      description: 'Визуальные пины и видеопины',
      fields: [
        { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Pinterest Access Token' },
        { name: 'boardId', label: 'Board ID', type: 'text', placeholder: 'ID доски для публикаций' },
      ],
    },
    {
      id: 'rutube',
      name: 'Rutube',
      icon: '🎥',
      color: 'bg-blue-500',
      description: 'Российская видеоплатформа',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Введите API ключ Rutube' },
        { name: 'channelId', label: 'Channel ID', type: 'text', placeholder: 'ID канала' },
      ],
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-blue-400',
      description: 'Публикации в канал или группу',
      fields: [
        { name: 'botToken', label: 'Bot Token', type: 'password', placeholder: '1234567890:ABC...' },
        { name: 'channelId', label: 'Channel ID', type: 'text', placeholder: '@channelname или -100xxxxxxxxxx' },
      ],
    },
    {
      id: 'vk',
      name: 'VKontakte',
      icon: '💬',
      color: 'bg-blue-600',
      description: 'Публикации в группу или на страницу',
      fields: [
        { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'VK Access Token' },
        { name: 'groupId', label: 'Group ID', type: 'text', placeholder: 'ID группы (без @)' },
      ],
    },
  ];

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
                  <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground/50" />
                  <div>
                    <p className="text-md text-muted-foreground">Нет подключенных площадок</p>
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
                          <div className={`w-12 h-12 rounded-lg ${config?.color || 'bg-gray-500'} flex items-center justify-center text-2xl`}>
                            {config?.icon || '🔗'}
                          </div>
                          <div>
                            <p className="font-medium">{platform.accountName}</p>
                            <p className="text-sm text-muted-foreground">{config?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              {platform.status === 'connected' && (
                                <Badge className="bg-green-500">
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
                            <p className="text-xs text-muted-foreground mt-1">
                              {platform.postsCount} публикаций
                            </p>
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
          <Card>
            <CardHeader>
              <CardTitle>Доступные площадки</CardTitle>
              <CardDescription>
                Выберите социальную сеть для подключения
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platforms.map((platform) => {
                  const connected = isConnected(platform.id);
                  return (
                    <div
                      key={platform.id}
                      className={`relative rounded-lg border p-6 space-y-4 transition-all ${
                        connected ? 'bg-green-500/5 border-green-500/20' : 'hover:border-primary/50'
                      }`}
                    >
                      {connected && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-500">
                            <Check className="w-3 h-3 mr-1" />
                            Подключено
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div className={`w-14 h-14 rounded-xl ${platform.color} flex items-center justify-center text-3xl shadow-lg`}>
                          {platform.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{platform.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {platform.description}
                          </p>
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full gap-2" 
                            disabled={connected}
                            onClick={() => setSelectedPlatform(platform)}
                          >
                            {connected ? (
                              <>
                                <Check className="w-4 h-4" />
                                Подключено
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                Подключить
                              </>
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <span className="text-2xl">{platform.icon}</span>
                              Подключить {platform.name}
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
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          {/* <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Settings className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Как подключить площадку?</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <span className="font-bold text-blue-500">1.</span>
                      <span>Выберите социальную сеть из списка доступных площадок</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-bold text-blue-500">2.</span>
                      <span>Получите API ключи в настройках вашей социальной сети</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-bold text-blue-500">3.</span>
                      <span>Введите данные в форму подключения</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-bold text-blue-500">4.</span>
                      <span>После подключения контент будет автоматически публиковаться через n8n</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
