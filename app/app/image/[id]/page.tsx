'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PixelCard from '@/components/PixelCard';
import GooeyButton from '@/components/GooeyButton';
import '../new/PixelCardPage.css';
import { 
  Upload, 
  X, 
  Palette, 
  ImageUp,
  Bolt,
  Send,
  MessageSquare
} from 'lucide-react';

interface ImageReference {
  id: string;
  file: File | null;
  preview: string;
}

interface Message {
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
}

interface Dialogue {
  _id: string;
  modelVersion: string;
  messages: Message[];
}

export default function DialoguePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const dialogueId = params.id as string;
  
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [newPrompt, setNewPrompt] = useState('');
  const [imageReferences, setImageReferences] = useState<ImageReference[]>([]);
  const [showStyles, setShowStyles] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageCount, setImageCount] = useState(1);
  const [mode, setMode] = useState<'1kSD' | '2kHD'>('1kSD');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && dialogueId) {
      fetchDialogue();
    }
  }, [user, dialogueId]);

  useEffect(() => {
    if (dialogue?.messages && dialogue.messages.length > 0) {
      scrollToBottom();
    }
  }, [dialogue?.messages]);

  const fetchDialogue = async () => {
    try {
      const response = await fetch(`/api/dialogues/${dialogueId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dialogue');
      }

      const data = await response.json();
      setDialogue(data.dialogue);
    } catch (error) {
      console.error('Error fetching dialogue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
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
    if (!newPrompt.trim() || !dialogueId) return;

    setIsSending(true);

    try {
      const response = await fetch(`/api/dialogues/${dialogueId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: newPrompt,
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

      setNewPrompt('');
      setImageReferences([]);
      await fetchDialogue();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm">секундочку...</div>
      </div>
    );
  }

  if (!user || !dialogue) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={handleLogout} />
      <SidebarInset className="!m-0 overflow-hidden">
        <div className="flex flex-col h-screen w-full">
          {/* Left Panel - Chat Messages + Input */}
          <div className="w-2/5 border-r border-border bg-muted/0 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              {dialogue.messages.map((message, index) => (
                <div key={message._id || index} className="space-y-2">
                  {message.role === 'user' && message.prompt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">Вы</span>
                      </div>
                      <div className="flex-1">
                        <div className="rounded-lg bg-background border border-border p-4">
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
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {message.role === 'assistant' && message.imageUrl && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">AI</span>
                      </div>
                      <div className="flex-1">
                        <PixelCard variant="default" className="mx-auto">
                          <img
                            src={message.imageUrl}
                            alt="Generated"
                            className="w-full rounded-lg"
                          />
                        </PixelCard>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {dialogue.messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">Начните диалог</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4 space-y-2 bg-background">
              {/* Image References */}
              <div className="rounded-lg bg-muted/20">
                <div className="grid grid-cols-5 gap-2 px-2 pt-2 rounded-lg">
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
                  
                  {imageReferences.length < 5 && (
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
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="Продолжите диалог или опишите новое изображение..."
                    className="w-full h-24 px-4 py-3 resize-none outline-none transition-colors pr-32"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="px-3 py-1.5 rounded-md bg-black text-white hover:bg-black/80 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Bolt className="w-3.5 h-3.5" />
                      Настройки
                    </button>
                    <button
                      onClick={() => setShowStyles(!showStyles)}
                      className="px-3 py-1.5 rounded-md bg-[#8B9A46] text-white hover:bg-[#7a8a3d] transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      Стили
                    </button>
                  </div>
                </div>
              </div>

              {/* Styles Dropdown */}
              {showStyles && (
                <div className="space-y-2">
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
                </div>
              )}

              {/* Settings Panel */}
              {showSettings && (
                <div className="space-y-2 rounded-lg ">
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
                </div>
              )}

              {/* Send Button */}
              <GooeyButton onClick={handleSendMessage}>
                <Send className="w-5 h-5" />
                {isSending ? 'Отправка...' : 'Отправить'}
              </GooeyButton>
            </div>
          </div>

          {/* Right Panel - Animation Only */}
          <div className="w-3/5 bg-muted/0 overflow-hidden flex items-center justify-center">
            <div className="text-center space-y-4 w-full px-8">
              <div className="mx-auto max-w-lg">
                <PixelCard variant="default">
                </PixelCard>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
