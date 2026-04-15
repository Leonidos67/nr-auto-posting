'use client';

import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Zap } from 'lucide-react';
import { CursorClickIcon } from '@/components/animated-icons/cursor-click';
import { ClapIcon } from '@/components/animated-icons/clap';
import { AudioLinesIcon } from '@/components/animated-icons/audio-lines';
import { ScanTextIcon } from '@/components/animated-icons/scan-text';
import { HandIcon } from '@/components/animated-icons/video-cut';
import { MicIcon } from '@/components/animated-icons/text-to-speech';
import { Instrument_Serif } from 'next/font/google';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
});

export default function Page() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [loadingCards, setLoadingCards] = useState<Record<string, boolean>>({});

  const getTimeRemaining = () => {
    const targetDate = new Date('2026-04-21T23:59:59');
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return { days, hours, minutes, seconds };
  };

  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining());

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const actionItems = [
    {
      id: 'generate-image',
      title: 'Сгенерировать изображение',
      icon: CursorClickIcon,
      iconRef: { current: null as any },
    },
    {
      id: 'generate-video',
      title: 'Сгенерировать видео',
      icon: ClapIcon,
      iconRef: { current: null as any },
    },
    {
      id: 'cut-video',
      title: 'Нарезать видео',
      icon: HandIcon,
      iconRef: { current: null as any },
    },
    {
      id: 'add-audio',
      title: 'Наложить аудио',
      icon: AudioLinesIcon,
      iconRef: { current: null as any },
    },
    {
      id: 'text-to-speech',
      title: 'Озвучить текст',
      icon: MicIcon,
      iconRef: { current: null as any },
    },
    {
      id: 'text-content',
      title: 'Работа с текстом',
      icon: ScanTextIcon,
      iconRef: { current: null as any },
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

  const handleCardClick = (action: string) => {
    setLoadingCards((prev) => ({ ...prev, [action]: true }));
    // Имитация загрузки
    setTimeout(() => {
      setLoadingCards((prev) => ({ ...prev, [action]: false }));
      // Здесь будет навигация или действие
      console.log(`Navigating to: ${action}`);
    }, 1500);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Доброе утро';
    if (hour >= 12 && hour < 18) return 'Добрый день';
    if (hour >= 18 && hour < 23) return 'Добрый вечер';
    return 'Доброй ночи';
  };

  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={handleLogout} />
      <SidebarInset>
        {/* <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/app">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{user.name}</span>
            </div>
            <ThemeToggle />
          </div>
        </header> */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid gap-2 md:grid-cols-7">
            {/* Left side - Action items */}
            <div className="md:col-span-4">
              <div className="grid gap-2 md:grid-cols-3">
                {actionItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleCardClick(item.id)}
                      onMouseEnter={() => {
                        item.iconRef.current?.startAnimation?.();
                      }}
                      onMouseLeave={() => {
                        item.iconRef.current?.stopAnimation?.();
                      }}
                      className="aspect-video rounded-xl bg-muted/50 border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer group flex flex-col items-center justify-center gap-4 p-2 relative overflow-hidden"
                      disabled={loadingCards[item.id]}
                    >
                      {loadingCards[item.id] ? (
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      ) : (
                        <>
                          <div className="p-2 rounded-xl transition-all group-hover:scale-80">
                            <IconComponent ref={item.iconRef} size={48} className="text-primary" />
                          </div>
                          <span className="text-sm font-medium text-center">{item.title}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side - Promo block */}
            <div className="md:col-span-3">
              <div className="rounded-xl bg-gradient-to-r from-[#8B9A46]/10 to-[#8B9A46]/5 border border-[#8B9A46]/20 h-full relative">
                <div className="flex gap-6 p-6 h-full">
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className={`${instrumentSerif.className} text-4xl font-bold text-[#8B9A46]`}>Скидка 20%</span>
                      <h2 className={`${instrumentSerif.className} text-4xl mb-3 text-foreground`}>
                        на апрель
                      </h2>
                      <div className="space-y-1 mb-4">
                        <p className="text-sm text-muted-foreground">
                          Получите скидку 20% на все
                          <br/>
                          генерации до конца апреля
                        </p>
                      </div>
                    </div>
                    <button className="px-6 py-2 rounded-md bg-[#8B9A46] text-white hover:bg-[#7a8a3d] cursor-pointer transition-colors text-sm font-medium self-start">
                      Принять участие
                    </button>
                  </div>
                  <div className="absolute bottom-0 right-0">
                    <div className="w-64 overflow-hidden rounded-lg" style={{ height: 'calc(100% - 20px)' }}>
                      <img 
                        src="https://i.ibb.co/V0V9WmL1/image-Photoroom-12.png" 
                        alt="Seedance 2.0" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="">
            <div className="flex gap-2 items-stretch">
              <h1 className="text-lg font-bold">{getGreeting()}, {user.name}</h1>
              <button className="px-3 rounded-md border border-[#8B9A46]/30 text-[#8B9A46] hover:bg-[#8B9A46]/10 transition-colors text-sm font-medium flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span>100</span>
              </button>
              <button className="px-3 rounded-md bg-[#8B9A46] text-white hover:bg-[#7a8a3d] cursor-pointer transition-colors text-sm font-medium">
                мой профиль
              </button>
            </div>
          </div>

          {/* Recent Projects Block */}
          <div className="rounded-xl bg-muted/50 min-h-[300px]">
            <div className="p-4 border-b border-border">
              <span className="text-sm font-medium">Недавние проекты</span>
            </div>
            <div className="flex items-center justify-center min-h-[240px]">
              <div className="text-center">
                <p className="text-md text-muted-foreground">У вас нет проектов</p>
                <p className="text-xs text-muted-foreground">
                  <button className="underline hover:text-white transition-colors cursor-pointer">
                    Создайте свой первый проект
                  </button>
                  , для того чтобыпродолжить работу.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
