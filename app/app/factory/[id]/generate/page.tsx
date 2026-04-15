'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Sparkles,
  Wand2,
  Send,
  Loader2,
  Check,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
  settings: {
    aspectRatio: string;
    videoDuration: number;
    targetPlatforms: string[];
  };
}

export default function GenerateContentPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  
  const [project, setProject] = useState<ContentProject | null>(null);
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState('');
  const [generatedContents, setGeneratedContents] = useState<any[]>([]);
  const [step, setStep] = useState<'brief' | 'generating' | 'ready'>('brief');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
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

  const handleLogout = async () => {
    await logout();
  };

  const generateBrief = async () => {
    if (!topic.trim()) {
      alert('Опишите тему для генерации');
      return;
    }

    setGenerating(true);
    setStep('generating');

    try {
      // Вызываем AI сервис для генерации контента
      const response = await fetch(`/api/factory/projects/${projectId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          details,
          count: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка генерации');
      }

      const data = await response.json();
      
      if (data.contents && data.contents.length > 0) {
        const content = data.contents[0];
        
        const brief = `# ТЕХНИЧЕСКОЕ ЗАДАНИЕ

## Тема: ${content.title}

${content.description ? `## Описание:\n${content.description}\n` : ''}

## Профиль стиля:
- Настроение: ${project?.styleProfile?.mood || 'modern'}
- Темп: ${project?.styleProfile?.tempo || 'medium'}
- Цветовая палитра: ${project?.styleProfile?.colors?.join(', ') || 'нейтральная'}
- Визуальный стиль: ${project?.styleProfile?.visualStyle || 'contemporary'}

## Параметры видео:
- Формат: ${project?.settings?.aspectRatio || '9:16'}
- Длительность: ${project?.settings?.videoDuration || 60} секунд
- Площадки: ${(project?.settings?.targetPlatforms || []).join(', ')}

## Сценарий:
${content.script || '1. Вступление (5 сек) - захват внимания\n2. Основной контент (40 сек) - раскрытие темы\n3. Призыв к действию (10 сек) - engagement\n4. Завершение (5 сек) - брендинг'}

## Теги:
${(content.tags || []).join(', ')}

## Промпт для генерации видео:
${content.videoPrompt || `${topic}, ${project?.styleProfile?.mood} mood, ${project?.styleProfile?.visualStyle} style, colors: ${project?.styleProfile?.colors?.join(', ')}, professional quality, 4k`}

## Музыка:
Стиль: ${project?.styleProfile?.musicStyle || 'upbeat'}
Темп: ${project?.styleProfile?.tempo || 'medium'}
Настроение: ${project?.styleProfile?.mood || 'modern'}`;

        setGeneratedBrief(brief);
        setGeneratedContents(data.contents);
        setStep('ready');
      } else {
        throw new Error('Контент не был сгенерирован');
      }
    } catch (error: any) {
      console.error('Error generating brief:', error);
      alert(error.message || 'Ошибка при генерации ТЗ');
      setStep('brief');
    } finally {
      setGenerating(false);
    }
  };

  const startContentGeneration = async () => {
    setGenerating(true);
    
    try {
      // Запускаем генерацию контента через API
      const response = await fetch(`/api/factory/projects/${projectId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          count: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка генерации');
      }

      const data = await response.json();
      
      alert('Контент готов к публикации!');
      router.push(`/app/factory/${projectId}`);
    } catch (error: any) {
      console.error('Error generating content:', error);
      alert(error.message || 'Ошибка при генерации контента');
    } finally {
      setGenerating(false);
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
              onClick={() => router.push(`/app/factory/${projectId}/upload`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Wand2 className="w-8 h-8 text-primary" />
                Генерация контента
              </h1>
              <p className="text-muted-foreground mt-1">
                {project?.name}
              </p>
            </div>
          </div>

          {/* Style Profile */}
          {project?.styleProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Профиль стиля
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="mt-4">
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

          {/* Brief Generation */}
          {step === 'brief' && (
            <Card>
              <CardHeader>
                <CardTitle>Создание ТЗ для генерации</CardTitle>
                <CardDescription>
                  Опишите тему и детали - AI создаст техническое задание
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Тема контента *</Label>
                  <Textarea
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Например: Обзор новой коллекции одежды Summer 2024"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details">
                    Дополнительные детали (опционально)
                  </Label>
                  <Textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Особые пожелания, ключевые моменты, стиль повествования..."
                    rows={4}
                  />
                </div>
                <Button
                  onClick={generateBrief}
                  disabled={!topic.trim() || generating}
                  className="w-full gap-2"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Генерация ТЗ...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Сгенерировать ТЗ
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Generating */}
          {step === 'generating' && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Генерация ТЗ...</h3>
                  <p className="text-muted-foreground">
                    AI анализирует ваш стиль и создает техническое задание
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ready Brief */}
          {step === 'ready' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  ТЗ готово
                </CardTitle>
                <CardDescription>
                  Проверьте и запустите генерацию контента
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {generatedBrief}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('brief')}
                    className="flex-1"
                  >
                    Изменить
                  </Button>
                  <Button
                    onClick={startContentGeneration}
                    disabled={generating}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Генерация...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Запустить генерацию
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
