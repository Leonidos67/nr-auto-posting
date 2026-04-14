'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PixelCard from '@/components/PixelCard';
import GooeyButton from '@/components/GooeyButton';
import './PixelCardPage.css';
import { 
  ChevronDown, 
  Upload, 
  X, 
  Palette, 
  Image as ImageIcon,
  Settings,
  Sparkles,
  ImageUp,
  Bolt,
  Send,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ModelVersion = 'image-2.0' | 'image-1.0';

interface ImageReference {
  id: string;
  file: File | null;
  preview: string;
}

export default function NewImagePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<ModelVersion>('image-2.0');
  const [prompt, setPrompt] = useState('');
  const [imageReferences, setImageReferences] = useState<ImageReference[]>([]);
  const [showStyles, setShowStyles] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageCount, setImageCount] = useState(1);
  const [mode, setMode] = useState<'1kSD' | '2kHD'>('1kSD');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogueStarted, setDialogueStarted] = useState(false);
  const [messages, setMessages] = useState<Array<{
    _id: string;
    role: 'user' | 'assistant';
    prompt?: string;
    imageUrl?: string;
    imageReferences?: string[];
    settings?: {
      mode: '1kSD' | '2kHD';
      aspectRatio: string;
      imageCount: number;
    };
    createdAt: string;
  }>>([]);
  const [currentDialogueId, setCurrentDialogueId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const response = await fetch('/api/dialogues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelVersion: selectedModel,
          prompt,
          imageReferences: imageReferences.map(ref => ref.preview),
          settings: {
            mode,
            aspectRatio,
            imageCount,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create dialogue');
      }

      const data = await response.json();
      
      // Fetch the created dialogue to get both user and AI messages
      const dialogueResponse = await fetch(`/api/dialogues/${data.dialogueId}`);
      if (dialogueResponse.ok) {
        const dialogueData = await dialogueResponse.json();
        setMessages(dialogueData.dialogue.messages || []);
      }
      
      setCurrentDialogueId(data.dialogueId);
      setDialogueStarted(true);
      setPrompt('');
      setImageReferences([]);
    } catch (error) {
      console.error('Error creating dialogue:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || imageReferences.length >= 5) return;

    const newReferences: ImageReference[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImageReferences(prev => [...prev, ...newReferences].slice(0, 5));
  };

  const removeImageReference = (id: string) => {
    setImageReferences(prev => {
      const ref = prev.find(r => r.id === id);
      if (ref) URL.revokeObjectURL(ref.preview);
      return prev.filter(r => r.id !== id);
    });
  };

  const handleSendMessage = async () => {
    if (!prompt.trim() || !currentDialogueId) return;

    setIsGenerating(true);

    try {
      const response = await fetch(`/api/dialogues/${currentDialogueId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          imageReferences: imageReferences.map(ref => ref.preview),
          settings: {
            mode,
            aspectRatio,
            imageCount,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Fetch updated dialogue to get all messages
      const dialogueResponse = await fetch(`/api/dialogues/${currentDialogueId}`);
      if (dialogueResponse.ok) {
        const dialogueData = await dialogueResponse.json();
        setMessages(dialogueData.dialogue.messages || []);
      }
      
      setPrompt('');
      setImageReferences([]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const modelOptions = [
    {
      value: 'image-2.0' as ModelVersion,
      label: 'IMAGE 2.0',
      description: 'Улучшенная согласованность, бесплатные мульти-референсы, комплексное обновление эффектов',
    },
    {
      value: 'image-1.0' as ModelVersion,
      label: 'IMAGE 1.0',
      description: 'Отличное соблюдение промта и стабильный результат',
    },
  ];

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
        <div className="relative flex flex-col h-screen">
          {/* Center - Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!dialogueStarted ? (
              // Initial placeholder
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-md w-full">
                  <div className="relative z-10 text-center p-8">
                    <h2 className="text-xl font-semibold mb-2">Изображение появится здесь</h2>
                    <p className="text-sm text-muted-foreground">
                      Введите промт и нажмите "Сгенерировать" для создания изображения
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Chat messages
              <div className="flex-1 p-8 pb-80 space-y-6 overflow-y-auto scrollbar-hide">
                {messages.map((message, index) => (
                  <div key={message._id || index}>
                    {message.role === 'user' && message.prompt && (
                      <div className="flex items-start gap-3 justify-end">
                        <div className="max-w-[70%]">
                          <div className="rounded-3xl border-b-4 border px-4 py-3 inline-block">
                            <p className="text-sm">{message.prompt}</p>
                            {message.imageReferences && message.imageReferences.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {message.imageReferences.map((ref, idx) => (
                                  <img
                                    key={idx}
                                    src={ref}
                                    alt="Reference"
                                    className="w-16 h-16 rounded object-cover"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          {/* <p className="text-xs text-muted-foreground mt-1 text-right">
                            {new Date(message.createdAt).toLocaleString('ru-RU')}
                          </p> */}
                        </div>
                      </div>
                    )}
                    
                    {message.role === 'assistant' && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full  flex items-center justify-center flex-shrink-0">
                          {/* <span className="text-xs font-medium text-green-500">AI</span> */}
                        </div>
                        <div className="flex-1 max-w-[70%] space-y-2">
                          {message.prompt && (
                            <div className="rounded-2xl">
                              <p className="text-sm">{message.prompt}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-4 gap-3">
                            {Array.from({ length: message.settings?.imageCount || 1 }).map((_, idx) => {
                              const ratio = message.settings?.aspectRatio || '1:1';
                              const aspectRatioStyle: React.CSSProperties = ratio === '1:1' 
                                ? { aspectRatio: '1/1' }
                                : ratio === '16:9' 
                                ? { aspectRatio: '16/9' }
                                : ratio === '9:16' 
                                ? { aspectRatio: '9/16' }
                                : ratio === '4:3'
                                ? { aspectRatio: '4/3' }
                                : { aspectRatio: '1/1' };
                              
                              return (
                                <PixelCard key={idx} variant="default" className="w-full">
                                  {message.imageUrl && (
                                    <img
                                      src={message.imageUrl}
                                      alt="Generated"
                                      className="w-full rounded-lg"
                                      style={{ ...aspectRatioStyle, objectFit: 'cover' }}
                                    />
                                  )}
                                </PixelCard>
                              );
                            })}
                          </div>
                          {/* <p className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleString('ru-RU')}
                          </p> */}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      {/* <span className="text-xs font-medium text-green-500">AI</span> */}
                    </div>
                    <div className="flex-1 max-w-[70%] space-y-2">
                      <div className="rounded-2xl">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <p className="text-sm">Генерирую...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                      <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">Начните диалог</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom - Fixed Input Form */}
          <div className="fixed bottom-4 left-0 right-2 px-12 z-50 space-y-2 bg-background" style={{ marginLeft: 'var(--sidebar-width, 0px)' }}>
            {/* Model Selection Dropdown with Settings & Styles */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-full flex cursor-pointer items-center justify-between px-4 py-2 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors">
                        <div className="text-left">
                          <p className="font-medium">{modelOptions.find(m => m.value === selectedModel)?.label}</p>
                          {/* <p className="text-xs text-muted-foreground mt-1">
                            {modelOptions.find(m => m.value === selectedModel)?.description}
                          </p> */}
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0">
                      {modelOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => setSelectedModel(option.value)}
                          className="p-4 cursor-pointer"
                        >
                          <div>
                            <p className="font-medium">{option.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <DropdownMenu open={showSettings} onOpenChange={setShowSettings}>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="px-4 py-2 rounded-lg bg-black text-white hover:bg-black/80 transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Bolt className="w-4 h-4" />
                      Настройки
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-120 p-4 space-y-1">
                    {/* Mode */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mode</label>
                      <div className="flex items-center gap-0.5 rounded-lg bg-muted/50">
                        <button
                          onClick={() => setMode('1kSD')}
                          className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer ${
                            mode === '1kSD'
                              ? 'text-white border bg-background'
                              : 'border-border hover:bg-background'
                          }`}
                        >
                          1kSD
                        </button>
                        <button
                          onClick={() => setMode('2kHD')}
                          className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer ${
                            mode === '2kHD'
                              ? 'text-white border bg-background'
                              : 'border-border hover:bg-background'
                          }`}
                        >
                          2kHD
                        </button>
                      </div>
                    </div>

                    {/* Aspect Ratio */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ratio</label>
                      <div className="flex items-center gap-0.5 rounded-lg bg-muted/50">
                        {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer ${
                              aspectRatio === ratio
                                ? 'text-white border bg-background'
                                : 'border-border hover:bg-background'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Output Count */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Output</label>
                      <div className="flex items-center gap-0.5 rounded-lg bg-muted/50">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                          <button
                            key={count}
                            onClick={() => setImageCount(count)}
                            className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer ${
                              imageCount === count
                                ? 'text-white border-primary/20 border bg-background'
                                : 'border-border hover:bg-background'
                            }`}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu open={showStyles} onOpenChange={setShowStyles}>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={() => setShowStyles(!showStyles)}
                      className="px-4 py-2 rounded-lg bg-[#8B9A46] text-white hover:bg-[#7a8a3d] transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Palette className="w-4 h-4" />
                      Стили
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-120 p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {['Реалистичный', 'Аниме', '3D Рендер', 'Минимализм', 'Арт', 'Фэнтези'].map((style) => (
                        <button
                          key={style}
                          className="px-3 py-2 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors text-sm cursor-pointer"
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Image References */}
            <div className="rounded-lg bg-muted/20">
              <div className="grid h-20 w-20 gap-2 px-2 pt-2 rounded-lg">
                {imageReferences.map((ref) => (
                  <div key={ref.id} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img
                      src={ref.preview}
                      alt="Reference"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImageReference(ref.id)}
                      className="absolute top-1 right-1 w-6 cursor-pointer h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {imageReferences.length < 2 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 bg-muted/50 border-dashed border-border hover:border-primary/50 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ImageUp className="w-6 h-6 text-muted-foreground" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={dialogueStarted ? "Продолжите диалог или опишите новое изображение..." : "Опишите изображение, которое хотите создать..."}
                  className="w-full h-22 px-4 py-3 resize-none outline-none transition-colors pr-16"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (dialogueStarted) {
                        handleSendMessage();
                      } else {
                        handleGenerate();
                      }
                    }
                  }}
                />
                <button
                  onClick={dialogueStarted ? handleSendMessage : handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {dialogueStarted ? <Send className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
