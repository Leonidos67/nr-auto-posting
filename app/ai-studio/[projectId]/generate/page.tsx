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
  Factory,
  Search,
  X,
  Plus,
  Headset,
  Mic,
  Mic2,
  Palette,
  Target,
  MagnetIcon,
  SearchAlert,
  Brain,
  LayoutTemplate,
  Map,
  Blocks,
  Monitor,
  Globe,
  AppWindow,
  Cog,
  Podcast,
  Play,
  Hash,
  RotateCcw,
  Copy,
  Download,
  FileText,
  FileDown,
  Edit,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';

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

// Шаблон структуры ТЗ по умолчанию
const defaultBriefStructure: {
  id: string;
  title: string;
  icon: string;
  subItems: { id: string; title: string }[];
}[] = [
  {
    id: 'analysis',
    title: 'Анализ и стратегия',
    icon: 'Brain',
    subItems: [
      { id: 'coreIdea', title: 'Главная идея' },
      { id: 'targetAudience', title: 'Целевая аудитория' },
      { id: 'emotionalHook', title: 'Эмоциональный крючок' },
      { id: 'uniqueAngle', title: 'Уникальный ракурс' },
    ],
  },
  {
    id: 'content',
    title: 'Структура контента',
    icon: 'LayoutTemplate',
    subItems: [
      { id: 'title', title: 'Заголовок' },
      { id: 'concept', title: 'Концепция' },
      { id: 'narrativeStructure', title: 'Структура повествования' },
      { id: 'keyMessages', title: 'Ключевые сообщения' },
      { id: 'callToAction', title: 'Призыв к действию' },
    ],
  },
  {
    id: 'visual',
    title: 'Визуальное решение',
    icon: 'Palette',
    subItems: [
      { id: 'style', title: 'Стиль' },
      { id: 'colorUsage', title: 'Использование цветов' },
      { id: 'keyScenes', title: 'Ключевые сцены' },
      { id: 'transitions', title: 'Переходы' },
      { id: 'textOverlay', title: 'Текст на экране' },
    ],
  },
  {
    id: 'audio',
    title: 'Аудио',
    icon: 'Mic2',
    subItems: [
      { id: 'musicStyle', title: 'Музыка' },
      { id: 'soundDesign', title: 'Звуковой дизайн' },
      { id: 'voiceover', title: 'Voiceover' },
    ],
  },
  {
    id: 'platforms',
    title: 'Платформы',
    icon: 'AppWindow',
    subItems: [
      { id: 'hashtags', title: 'Хештеги' },
      { id: 'caption', title: 'Текст поста' },
    ],
  },
  {
    id: 'production',
    title: 'Производство',
    icon: 'Podcast',
    subItems: [
      { id: 'videoPrompt', title: 'Промпт для видео' },
      { id: 'imagePrompt', title: 'Промпт для обложки' },
    ],
  },
];

export default function GenerateContentPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  
  const [project, setProject] = useState<ContentProject | null>(null);
  const [allProjects, setAllProjects] = useState<ContentProject[]>([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<any>(null);
  const [generatedContents, setGeneratedContents] = useState<any[]>([]);
  const [step, setStep] = useState<'brief' | 'generating' | 'ready'>('brief');
  const [loadingSteps, setLoadingSteps] = useState<{
    thinking: boolean;
    analysis: boolean;
    content: boolean;
    visual: boolean;
    audio: boolean;
    platforms: boolean;
    production: boolean;
  }>({
    thinking: false,
    analysis: false,
    content: false,
    visual: false,
    audio: false,
    platforms: false,
    production: false,
  });
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [editingStructure, setEditingStructure] = useState(false);
  const [newSubItemTitle, setNewSubItemTitle] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [briefStructure, setBriefStructure] = useState<{
    id: string;
    title: string;
    icon: string;
    subItems: { id: string; title: string }[];
  }[]>(defaultBriefStructure);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Функция сброса структуры к шаблону
  const resetStructureToDefault = () => {
    setBriefStructure(defaultBriefStructure);
    setEditingStructure(false);
    setSelectedSectionId(null);
    setNewSubItemTitle('');
  };

  // Копировать в буфер обмена
  const copyToClipboard = async (text: string, label: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      toast.success(`${label} скопирован`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Не удалось скопировать');
    }
  };

  // Скачать ТЗ в формате .txt
  const downloadAsTxt = () => {
    if (!generatedBrief) return;

    let content = 'ТЕХНИЧЕСКОЕ ЗАДАНИЕ\n';
    content += '='.repeat(60) + '\n\n';
    content += `Проект: ${project?.name || ''}\n`;
    content += `Тема: ${topic}\n\n`;
    content += '='.repeat(60) + '\n\n';

    briefStructure.forEach((section) => {
      const sectionData = generatedBrief[section.id];
      if (!sectionData) return;

      content += `${section.title.toUpperCase()}\n`;
      content += '-'.repeat(40) + '\n';

      Object.entries(sectionData).forEach(([key, value]: [string, any]) => {
        const formattedKey = key
          .replace(/videoPrompt/g, 'Промпт для видео')
          .replace(/imagePrompt/g, 'Промпт для обложки')
          .replace(/coreIdea/g, 'Главная идея')
          .replace(/targetAudience/g, 'Целевая аудитория')
          .replace(/emotionalHook/g, 'Эмоциональный крючок')
          .replace(/uniqueAngle/g, 'Уникальный ракурс')
          .replace(/title/g, 'Заголовок')
          .replace(/concept/g, 'Концепция')
          .replace(/narrativeStructure/g, 'Структура повествования')
          .replace(/keyMessages/g, 'Ключевые сообщения')
          .replace(/callToAction/g, 'Призыв к действию')
          .replace(/style/g, 'Стиль')
          .replace(/colorUsage/g, 'Использование цветов')
          .replace(/keyScenes/g, 'Ключевые сцены')
          .replace(/transitions/g, 'Переходы')
          .replace(/textOverlay/g, 'Текст на экране')
          .replace(/musicStyle/g, 'Музыка')
          .replace(/soundDesign/g, 'Звуковой дизайн')
          .replace(/voiceover/g, 'Озвучка')
          .replace(/hashtags/g, 'Хештеги')
          .replace(/caption/g, 'Текст поста');

        content += `\n${formattedKey}:\n`;

        if (Array.isArray(value)) {
          value.forEach((item: any, idx: number) => {
            if (typeof item === 'object') {
              content += `  ${idx + 1}. `;
              Object.entries(item).forEach(([subKey, subValue]) => {
                const formattedSubKey = subKey
                  .replace(/time/g, 'Время')
                  .replace(/description/g, 'Описание')
                  .replace(/purpose/g, 'Цель');
                content += `${formattedSubKey}: ${subValue}\n     `;
              });
              content += '\n';
            } else {
              content += `  ${idx + 1}. ${item}\n`;
            }
          });
        } else {
          content += `  ${value}\n`;
        }
      });

      content += '\n' + '='.repeat(60) + '\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ТЗ_${project?.name || 'project'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('ТЗ скачано в формате .txt');
  };

  // Скачать ТЗ в формате .docx (упрощенный HTML формат)
  const downloadAsDocx = () => {
    if (!generatedBrief) return;

    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Техническое задание</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
          h1 { font-size: 18pt; color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          h2 { font-size: 14pt; color: #0BA141; margin-top: 20px; }
          h3 { font-size: 12pt; color: #555; font-weight: bold; }
          p { margin: 8px 0; }
          ul { margin: 8px 0; padding-left: 20px; }
          li { margin: 4px 0; }
          .section { margin-bottom: 30px; }
          .badge { background: #e8f5e9; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: #0BA141; }
          .purpose { font-style: italic; color: #666; }
        </style>
      </head>
      <body>
    `;

    htmlContent += `<h1>ТЕХНИЧЕСКОЕ ЗАДАНИЕ</h1>`;
    htmlContent += `<p><strong>Проект:</strong> ${project?.name || ''}</p>`;
    htmlContent += `<p><strong>Тема:</strong> ${topic}</p>`;
    htmlContent += `<hr/>`;

    briefStructure.forEach((section) => {
      const sectionData = generatedBrief[section.id];
      if (!sectionData) return;

      htmlContent += `<div class="section">`;
      htmlContent += `<h2>${section.title}</h2>`;

      Object.entries(sectionData).forEach(([key, value]: [string, any]) => {
        const formattedKey = key
          .replace(/videoPrompt/g, 'Промпт для видео')
          .replace(/imagePrompt/g, 'Промпт для обложки')
          .replace(/coreIdea/g, 'Главная идея')
          .replace(/targetAudience/g, 'Целевая аудитория')
          .replace(/emotionalHook/g, 'Эмоциональный крючок')
          .replace(/uniqueAngle/g, 'Уникальный ракурс')
          .replace(/title/g, 'Заголовок')
          .replace(/concept/g, 'Концепция')
          .replace(/narrativeStructure/g, 'Структура повествования')
          .replace(/keyMessages/g, 'Ключевые сообщения')
          .replace(/callToAction/g, 'Призыв к действию')
          .replace(/style/g, 'Стиль')
          .replace(/colorUsage/g, 'Использование цветов')
          .replace(/keyScenes/g, 'Ключевые сцены')
          .replace(/transitions/g, 'Переходы')
          .replace(/textOverlay/g, 'Текст на экране')
          .replace(/musicStyle/g, 'Музыка')
          .replace(/soundDesign/g, 'Звуковой дизайн')
          .replace(/voiceover/g, 'Озвучка')
          .replace(/hashtags/g, 'Хештеги')
          .replace(/caption/g, 'Текст поста');

        htmlContent += `<h3>${formattedKey}</h3>`;

        if (Array.isArray(value)) {
          htmlContent += `<ul>`;
          value.forEach((item: any, idx: number) => {
            if (typeof item === 'object' && item.time) {
              htmlContent += `<li><span class="badge">${item.time}</span> ${item.description}`;
              if (item.purpose) {
                htmlContent += `<br/><span class="purpose">Цель: ${item.purpose}</span>`;
              }
              htmlContent += `</li>`;
            } else {
              htmlContent += `<li>${typeof item === 'string' ? item : JSON.stringify(item)}</li>`;
            }
          });
          htmlContent += `</ul>`;
        } else {
          htmlContent += `<p>${value}</p>`;
        }
      });

      htmlContent += `</div>`;
    });

    htmlContent += `</body></html>`;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ТЗ_${project?.name || 'project'}_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('ТЗ скачано в формате .doc');
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchAllProjects();
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
    setCompletedSteps(new Set());
    
    // Start with thinking
    setLoadingSteps(prev => ({ ...prev, thinking: true }));

    // Simulate progressive step completion
    const steps = ['analysis', 'content', 'visual', 'audio', 'platforms', 'production'];
    let currentStepIndex = 0;
    
    const stepInterval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        setCompletedSteps(prev => {
          const newSet = new Set(prev);
          newSet.add(steps[currentStepIndex]);
          return newSet;
        });
        currentStepIndex++;
      } else {
        clearInterval(stepInterval);
      }
    }, 2000); // Complete a step every 2 seconds

    try {
      // Вызываем AI сервис для генерации интеллектуального ТЗ
      const response = await fetch(`/api/factory/projects/${projectId}/generate-brief`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          details,
          structure: briefStructure, // Передаем кастомную структуру ТЗ
        }),
      });

      // Clear the interval
      clearInterval(stepInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка генерации');
      }

      const data = await response.json();
      
      if (data.brief) {
        // Mark all steps as completed
        const allSteps = ['thinking', 'analysis', 'content', 'visual', 'audio', 'platforms', 'production'];
        setCompletedSteps(new Set(allSteps));
        
        // Small delay to show the final checkmark
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setGeneratedBrief(data.brief);
        setStep('ready');
        setLoadingSteps({
          thinking: false,
          analysis: false,
          content: false,
          visual: false,
          audio: false,
          platforms: false,
          production: false,
        });
      } else {
        throw new Error('ТЗ не было сгенерировано');
      }
    } catch (error: any) {
      console.error('Error generating brief:', error);
      alert(error.message || 'Ошибка при генерации ТЗ');
      setStep('brief');
      setLoadingSteps({
        thinking: false,
        analysis: false,
        content: false,
        visual: false,
        audio: false,
        platforms: false,
        production: false,
      });
      setCompletedSteps(new Set());
    } finally {
      clearInterval(stepInterval);
      setGenerating(false);
    }
  };

  const startContentGeneration = async () => {
    if (!generatedBrief) {
      alert('Сначала сгенерируйте ТЗ');
      return;
    }

    setGenerating(true);
    
    try {
      // Запускаем генерацию контента через API с использованием ТЗ
      const response = await fetch(`/api/factory/projects/${projectId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          brief: generatedBrief,
          count: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка генерации');
      }

      const data = await response.json();
      
      alert('Контент готов к публикации!');
      router.push(`/ai-studio/${projectId}`);
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
        <div className="flex-1 p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center border gap-2 hover:bg-muted/50 px-2 py-1.5 rounded-md transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-[#8B9A46] flex items-center justify-center flex-shrink-0">
                    <Factory className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h1 className="text-sm font-bold">{project?.name || 'Загрузка...'}</h1>
                      <ChevronsUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                {/* Search Input */}
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

                {/* Projects List */}
                <div className="max-h-64 overflow-y-auto space-y-1 p-1">
                  {allProjects
                    .filter((p) => 
                      p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
                      (p.description && p.description.toLowerCase().includes(projectSearch.toLowerCase()))
                    )
                    .map((p) => (
                      <DropdownMenuItem
                        key={p._id}
                        onClick={() => router.push(`/ai-studio/${p._id}/generate`)}
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

                {/* Create Project Button */}
                <button
                  onClick={() => router.push('/ai-studio/new')}
                  className="w-full flex items-center border-t justify-center gap-2 px-4 py-2.5 rounded-lg text-white transition-colors text-sm font-medium cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Создать проект
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="flex gap-4 items-start">
            {/* Left Column - Style Profile, Brief Generation, Ready Brief (2/3 width) */}
            <div className="flex-1 space-y-4">
              {/* Style Profile */}
              {/* {project?.styleProfile && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Профиль стиля
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Настроение</p>
                        <p className="font-semibold capitalize">{project.styleProfile.mood}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Темп</p>
                        <p className="font-semibold capitalize">{project.styleProfile.tempo}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Стиль музыки</p>
                        <p className="font-semibold">{project.styleProfile.musicStyle || '-'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Визуальный стиль</p>
                        <p className="font-semibold">{project.styleProfile.visualStyle || '-'}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-2">Цветовая палитра</p>
                      <div className="flex gap-2">
                        {project.styleProfile.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-10 rounded-lg border-2 border-border shadow-sm hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )} */}

              {/* Brief Generation */}
              {step === 'brief' && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Создание ТЗ для генерации</CardTitle>
                    <CardDescription>
                      Опишите тему и детали - AI создаст детальное техническое задание
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="topic" className="text-sm font-medium">
                        Тема контента <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Например: Обзор нового логотипа из референса"
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="details" className="text-sm font-medium">
                        Дополнительные детали <span className="text-muted-foreground">(опционально)</span>
                      </Label>
                      <Textarea
                        id="details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Особые пожелания, ключевые моменты, стиль повествования..."
                        rows={4}
                        className="resize-none"
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
                <Card className="border-border/50">
                  <CardContent className="py-12 space-y-6">
                    {/* Main thinking animation */}
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                      <div className="relative">
                        <Loader2 className="w-16 h-16 animate-spin text-primary" />
                        <Sparkles className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/50" />
                      </div>
                      <h3 className="text-xl font-semibold animate-pulse">Размышление...</h3>
                    </div>

                    {/* Steps list */}
                    <div className="space-y-4">
                      {/* Показываем только выбранные пункты из briefStructure */}
                      <div className="space-y-3">
                        {briefStructure.map((section) => (
                          <div key={section.id} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-primary/30">
                              {completedSteps.has(section.id) ? (
                                <Check className="w-5 h-5" />
                              ) : (
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              )}
                            </div>
                            <span className="text-sm font-medium">{section.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ready Brief - Main Content */}
              {step === 'ready' && generatedBrief && (
                <Card className="border-border/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Check className="w-5 h-5" />
                          ТЗ готово
                        </CardTitle>
                        <CardDescription>
                          AI проанализировал вашу тему и создал детальное техническое задание
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Собираем весь текст из ТЗ
                            let allText = '';
                            briefStructure.forEach((section) => {
                              const sectionData = generatedBrief[section.id];
                              if (!sectionData) return;
                              
                              allText += `\n${section.title.toUpperCase()}\n`;
                              allText += '='.repeat(40) + '\n';
                              
                              Object.entries(sectionData).forEach(([key, value]: [string, any]) => {
                                const formattedKey = key
                                  .replace(/videoPrompt/g, 'Промпт для видео')
                                  .replace(/imagePrompt/g, 'Промпт для обложки')
                                  .replace(/coreIdea/g, 'Главная идея')
                                  .replace(/targetAudience/g, 'Целевая аудитория')
                                  .replace(/emotionalHook/g, 'Эмоциональный крючок')
                                  .replace(/uniqueAngle/g, 'Уникальный ракурс')
                                  .replace(/title/g, 'Заголовок')
                                  .replace(/concept/g, 'Концепция')
                                  .replace(/narrativeStructure/g, 'Структура повествования')
                                  .replace(/keyMessages/g, 'Ключевые сообщения')
                                  .replace(/callToAction/g, 'Призыв к действию')
                                  .replace(/style/g, 'Стиль')
                                  .replace(/colorUsage/g, 'Использование цветов')
                                  .replace(/keyScenes/g, 'Ключевые сцены')
                                  .replace(/transitions/g, 'Переходы')
                                  .replace(/textOverlay/g, 'Текст на экране')
                                  .replace(/musicStyle/g, 'Музыка')
                                  .replace(/soundDesign/g, 'Звуковой дизайн')
                                  .replace(/voiceover/g, 'Озвучка')
                                  .replace(/hashtags/g, 'Хештеги')
                                  .replace(/caption/g, 'Текст поста')
                                  .replace(/adaptations/g, 'Адаптации');
                                
                                allText += `\n${formattedKey}: `;
                                
                                if (Array.isArray(value)) {
                                  value.forEach((item: any, idx: number) => {
                                    if (typeof item === 'object' && item.time) {
                                      allText += `\n  ${idx + 1}. [${item.time}] ${item.description}`;
                                      if (item.purpose) allText += ` - Цель: ${item.purpose}`;
                                    } else {
                                      allText += `\n  ${idx + 1}. ${typeof item === 'string' ? item : JSON.stringify(item)}`;
                                    }
                                  });
                                } else {
                                  allText += String(value);
                                }
                                allText += '\n';
                              });
                              allText += '\n';
                            });
                            
                            copyToClipboard(allText, 'Всё ТЗ', 'all');
                          }}
                          className="gap-2"
                        >
                          {copiedField === 'all' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          {/* Скопировать */}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => setStep('brief')}
                        >
                          <Edit2 className="w-4 h-4" />
                          {/* Внести правки */}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadAsTxt}
                          className="gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          .txt
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadAsDocx}
                          className="gap-2"
                        >
                          <FileDown className="w-4 h-4" />
                          .doc
                        </Button>
                        <Button
                          onClick={startContentGeneration}
                          disabled={generating}
                          className="flex-1 gap-2"
                          size="sm"
                        >
                          {generating ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Генерация...
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5" />
                              Запустить
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Показываем только выбранные разделы из briefStructure */}
                    {briefStructure.map((section) => {
                      const sectionData = generatedBrief[section.id];
                      if (!sectionData) return null;

                      return (
                        <div key={section.id} id={section.id} className="space-y-3">
                          <h3 className="text-base font-semibold flex items-center gap-2 pb-2 border-b">
                            {section.id === 'analysis' && <Sparkles className="w-4 h-4 text-primary" />}
                            {section.title}
                          </h3>
                          <div className="space-y-2">
                            {Object.entries(sectionData).map(([key, value]: [string, any]) => {
                              // Форматируем ключ для отображения
                              const formattedKey = key
                                .replace(/videoPrompt/g, 'Промпт для видео')
                                .replace(/imagePrompt/g, 'Промпт для обложки')
                                .replace(/coreIdea/g, 'Главная идея')
                                .replace(/targetAudience/g, 'Целевая аудитория')
                                .replace(/emotionalHook/g, 'Эмоциональный крючок')
                                .replace(/uniqueAngle/g, 'Уникальный ракурс')
                                .replace(/title/g, 'Заголовок')
                                .replace(/concept/g, 'Концепция')
                                .replace(/narrativeStructure/g, 'Структура повествования')
                                .replace(/keyMessages/g, 'Ключевые сообщения')
                                .replace(/callToAction/g, 'Призыв к действию')
                                .replace(/style/g, 'Стиль')
                                .replace(/colorUsage/g, 'Использование цветов')
                                .replace(/keyScenes/g, 'Ключевые сцены')
                                .replace(/transitions/g, 'Переходы')
                                .replace(/textOverlay/g, 'Текст на экране')
                                .replace(/musicStyle/g, 'Музыка')
                                .replace(/soundDesign/g, 'Звуковой дизайн')
                                .replace(/voiceover/g, 'Озвучка')
                                .replace(/hashtags/g, 'Хештеги')
                                .replace(/caption/g, 'Текст поста')
                                .replace(/adaptations/g, 'Адаптации');

                              // Промпты - отдельный выделенный блок
                              if (key === 'videoPrompt' || key === 'imagePrompt') {
                                return (
                                  <div key={key} className="group relative mt-4 pt-4 border-t">
                                    <div className="mb-2">
                                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{formattedKey}</span>
                                    </div>
                                    <div className="p-4 pr-12 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-primary/20 shadow-sm relative">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => copyToClipboard(String(value), formattedKey, key)}
                                        title="Копировать промпт"
                                      >
                                        {copiedField === key ? (
                                          <Check className="w-3 h-3" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </Button>
                                      <p className="font-mono text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {String(value)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              }

                              // Все остальные поля - компактный формат в строку
                              return (
                                <div key={key} className="group">
                                  <span className="text-sm leading-relaxed text-muted-foreground">
                                    <span className="font-semibold underline">{formattedKey}:</span>{' '}
                                    {Array.isArray(value) ? (
                                      <span className="inline-flex flex-wrap gap-1">
                                        {value.map((item: any, idx: number) => (
                                          <span key={idx} className="inline-flex items-center gap-1">
                                            {typeof item === 'object' && item.time ? (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-xs">
                                                <span className="font-medium text-primary">{item.time}</span>
                                                <span>{item.description}</span>
                                              </span>
                                            ) : (
                                              <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                                            )}
                                            {idx < value.length - 1 && <span className="text-muted-foreground/50">•</span>}
                                          </span>
                                        ))}
                                      </span>
                                    ) : (
                                      String(value)
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Brief Structure Navigation (1/3 width) */}
            <div className="w-120 flex-shrink-0">
              <div className="sticky top-4">
                {step === 'brief' ? (
                  /* Brief Structure Editor */
                  <div className="p-2 bg-card text-card-foreground flex flex-col gap-2 rounded-xl border shadow-sm border-border/50">
                    <div className="px-4 pt-2 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold">Структура ТЗ</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Настройте перед генерацией</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={resetStructureToDefault}
                          title="Вернуть структуру по умолчанию"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => setEditingStructure(!editingStructure)}
                        >
                          {editingStructure ? 'Готово' : 'Редактировать'}
                        </Button>
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
                        {briefStructure.map((section) => (
                          <div key={section.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">{section.title}</span>
                                <span className="text-xs text-muted-foreground">({section.subItems.length})</span>
                              </div>
                              {editingStructure && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-red-50"
                                  onClick={() => {
                                    setBriefStructure(briefStructure.filter(s => s.id !== section.id));
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            
                            {editingStructure && (
                              <div className="pl-6 space-y-1">
                                {section.subItems.map((subItem) => (
                                  <div key={subItem.id} className="flex items-center justify-between text-sm py-1">
                                    <span className="text-muted-foreground">{subItem.title}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0 hover:bg-red-50"
                                      onClick={() => {
                                        setBriefStructure(briefStructure.map(s => 
                                          s.id === section.id 
                                            ? { ...s, subItems: s.subItems.filter(si => si.id !== subItem.id) }
                                            : s
                                        ));
                                      }}
                                    >
                                      <X className="w-2 h-2" />
                                    </Button>
                                  </div>
                                ))}
                                
                                {selectedSectionId === section.id ? (
                                  <div className="flex gap-2 mt-2">
                                    <input
                                      type="text"
                                      value={newSubItemTitle}
                                      onChange={(e) => setNewSubItemTitle(e.target.value)}
                                      placeholder="Название подпункта"
                                      className="flex-1 px-2 py-1 text-sm border rounded"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newSubItemTitle.trim()) {
                                          setBriefStructure(briefStructure.map(s => 
                                            s.id === section.id 
                                              ? { 
                                                  ...s, 
                                                  subItems: [...s.subItems, { 
                                                    id: Date.now().toString(), 
                                                    title: newSubItemTitle.trim() 
                                                  }] 
                                                }
                                              : s
                                          ));
                                          setNewSubItemTitle('');
                                          setSelectedSectionId(null);
                                        }
                                      }}
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      className="h-7 px-3"
                                      onClick={() => {
                                        if (newSubItemTitle.trim()) {
                                          setBriefStructure(briefStructure.map(s => 
                                            s.id === section.id 
                                              ? { 
                                                  ...s, 
                                                  subItems: [...s.subItems, { 
                                                    id: Date.now().toString(), 
                                                    title: newSubItemTitle.trim() 
                                                  }] 
                                                }
                                              : s
                                          ));
                                          setNewSubItemTitle('');
                                          setSelectedSectionId(null);
                                        }
                                      }}
                                    >
                                    Добавить
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => {
                                      setSelectedSectionId(null);
                                      setNewSubItemTitle('');
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs mt-1"
                                  onClick={() => {
                                    setSelectedSectionId(section.id);
                                    setNewSubItemTitle('');
                                  }}
                                >
                                  + Добавить подпункт
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {editingStructure && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            const newId = `section_${Date.now()}`;
                            setBriefStructure([...briefStructure, {
                              id: newId,
                              title: 'Новый раздел',
                              icon: 'LayoutTemplate',
                              subItems: [],
                            }]);
                          }}
                        >
                          + Добавить раздел
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                ) : (
                  /* Brief Structure Navigation */
                  <div className="p-2 bg-card text-card-foreground flex flex-col gap-2 rounded-xl border shadow-sm border-border/50">
                    <div className='px-4 pt-2'>
                      <h3 className="text-base font-semibold">Структура ТЗ</h3>
                    </div>
                    <div>
                      <nav className="space-y-2">
                        {/* Показываем только выбранные разделы из briefStructure */}
                        {briefStructure.map((section) => {
                          const hasData = generatedBrief?.[section.id];
                          return (
                            <a
                              key={section.id}
                              href={`#${section.id}`}
                              className={`block p-3 rounded-lg transition-colors border ${
                                hasData 
                                  ? 'hover:bg-muted/50 border-transparent hover:border-border' 
                                  : 'border-transparent cursor-default'
                              }`}
                              onClick={(e) => {
                                if (!hasData) {
                                  e.preventDefault();
                                  return;
                                }
                                e.preventDefault();
                                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{section.title}</span>
                              </div>
                            </a>
                          );
                        })}
                      </nav>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      // </div>
  );
}
