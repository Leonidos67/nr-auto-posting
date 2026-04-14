'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Factory,
  Upload,
  Video,
  Sparkles,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function NewProjectPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [videoDuration, setVideoDuration] = useState(60);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
  };

  const platforms = [
    { id: 'youtube-shorts', name: 'YouTube Shorts', icon: '🎬' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'instagram-reels', name: 'Instagram Reels', icon: '📸' },
    { id: 'pinterest', name: 'Pinterest', icon: '📌' },
    { id: 'rutube', name: 'Rutube', icon: '🎥' },
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      alert('Введите название проекта');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch('/api/factory/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          description,
          platforms: selectedPlatforms,
          settings: {
            videoDuration,
            aspectRatio,
            targetPlatforms: selectedPlatforms,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const data = await response.json();
      
      // Переход на страницу загрузки референсов
      router.push(`/app/factory/${data.project._id}/upload`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Ошибка при создании проекта');
    } finally {
      setCreating(false);
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
        <div className="flex-1 p-8 max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/app/factory')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Factory className="w-8 h-8 text-primary" />
                Новый проект
              </h1>
              <p className="text-muted-foreground mt-1">
                Шаг {step} из 3
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>
                  Дайте название и описание вашему проекту
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Название проекта *</Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Например: Бренд одежды Summer 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Опишите ваш бренд, стиль и цели..."
                    rows={4}
                  />
                </div>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!projectName.trim()}
                  className="w-full gap-2"
                >
                  Далее
                  <Check className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Platforms */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Выберите площадки</CardTitle>
                <CardDescription>
                  На какие площадки будет публиковаться контент?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedPlatforms.includes(platform.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{platform.icon}</div>
                      <div className="font-medium">{platform.name}</div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Назад
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={selectedPlatforms.length === 0}
                    className="flex-1 gap-2"
                  >
                    Далее
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Settings */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Настройки контента</CardTitle>
                <CardDescription>
                  Настройте формат и параметры видео
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <Label>Формат видео</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { ratio: '9:16', label: 'Вертикальное', desc: 'Shorts, Reels, TikTok' },
                      { ratio: '16:9', label: 'Горизонтальное', desc: 'YouTube, Rutube' },
                      { ratio: '1:1', label: 'Квадрат', desc: 'Instagram, Pinterest' },
                    ].map((option) => (
                      <button
                        key={option.ratio}
                        onClick={() => setAspectRatio(option.ratio as any)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          aspectRatio === option.ratio
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.ratio}</div>
                        <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Длительность видео: {videoDuration} сек
                  </Label>
                  <Input
                    id="duration"
                    type="range"
                    min="15"
                    max="180"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value))}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>15 сек</span>
                    <span>180 сек</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    Назад
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={creating}
                    className="flex-1 gap-2"
                  >
                    {creating ? (
                      <>Создание...</>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Создать проект
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
