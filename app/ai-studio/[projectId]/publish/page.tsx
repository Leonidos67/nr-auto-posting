'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Send,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ContentProject {
  _id: string;
  name: string;
  description: string;
  status: string;
  styleProfile?: {
    colors: string[];
    mood: string;
    tempo: string;
    musicStyle?: string;
    visualStyle?: string;
  };
  contentCount: number;
}

interface Platform {
  _id: string;
  platform: string;
  accountName: string;
  status: string;
}

interface PublishResult {
  platform: string;
  success: boolean;
  error?: string;
}

export default function PublishContentPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  
  const [project, setProject] = useState<ContentProject | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<PublishResult[]>([]);
  const [step, setStep] = useState<'select' | 'publishing' | 'complete'>('select');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchPlatforms();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/factory/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/platforms');
      if (response.ok) {
        const data = await response.json();
        setPlatforms(data.platforms || []);
      }
    } catch (error) {
      console.error('Error fetching platforms:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      alert('Выберите хотя бы одну платформу для публикации');
      return;
    }

    setPublishing(true);
    setStep('publishing');

    try {
      const content = {
        title: project?.name || 'Generated Content',
        description: project?.description || '',
      };

      const response = await fetch(`/api/factory/projects/${projectId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platforms: selectedPlatforms,
          content,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка публикации');
      }

      const data = await response.json();
      setPublishResults(data.results || []);
      setStep('complete');
      
      // Обновляем проект
      fetchProject();
    } catch (error: any) {
      console.error('Error publishing content:', error);
      alert(error.message || 'Ошибка при публикации');
      setStep('select');
    } finally {
      setPublishing(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return '📱';
      case 'vk':
        return '🌐';
      case 'instagram-reels':
        return '📸';
      case 'youtube-shorts':
        return '🎥';
      case 'tiktok':
        return '🎵';
      case 'pinterest':
        return '📌';
      default:
        return '🔗';
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
        <div className="flex-1 p-8 min-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/ai-studio/${projectId}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                Публикация контента
              </h1>
              <p className="text-muted-foreground mt-1">
                {project?.name}
              </p>
            </div>
          </div>

          {/* Select Platforms */}
          {step === 'select' && (
            <Card>
              <CardHeader>
                <CardTitle>Выберите платформы для публикации</CardTitle>
                <CardDescription>
                  Контент будет опубликован на выбранных платформах
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {platforms.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Нет подключенных платформ</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => router.push('/app/platforms')}
                    >
                      Подключить платформу
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-3">
                      {platforms.map((platform) => (
                        <div
                          key={platform._id}
                          className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            id={platform._id}
                            checked={selectedPlatforms.includes(platform._id)}
                            onCheckedChange={() => togglePlatform(platform._id)}
                          />
                          <label
                            htmlFor={platform._id}
                            className="flex items-center gap-3 cursor-pointer flex-1"
                          >
                            <span className="text-2xl">{getPlatformIcon(platform.platform)}</span>
                            <div className="flex-1">
                              <p className="font-medium">{platform.accountName}</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {platform.platform.replace('-', ' ')}
                              </p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${
                              platform.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                          </label>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={handlePublish}
                      disabled={selectedPlatforms.length === 0 || publishing}
                      className="w-full gap-2"
                      size="lg"
                    >
                      {publishing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Публикация...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Опубликовать на {selectedPlatforms.length} платформ{selectedPlatforms.length === 1 ? 'е' : 'ах'}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Publishing */}
          {step === 'publishing' && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Публикация контента...</h3>
                  <p className="text-muted-foreground">
                    Контент публикуется на выбранных платформах
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complete */}
          {step === 'complete' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Публикация завершена
                </CardTitle>
                <CardDescription>
                  Результаты публикации на платформах
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {publishResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-4 border rounded-lg ${
                        result.success ? 'border-green-500/50' : 'border-red-500/50'
                      }`}
                    >
                      <span className="text-2xl">{getPlatformIcon(result.platform)}</span>
                      <div className="flex-1">
                        <p className="font-medium capitalize">
                          {result.platform.replace('-', ' ')}
                        </p>
                        {result.error && (
                          <p className="text-sm text-red-500">{result.error}</p>
                        )}
                      </div>
                      {result.success ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/ai-studio/${projectId}`)}
                    className="flex-1"
                  >
                    К проекту
                  </Button>
                  <Button
                    onClick={() => {
                      setStep('select');
                      setPublishResults([]);
                    }}
                    className="flex-1"
                  >
                    Опубликовать еще
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      // </div>
  );
}
