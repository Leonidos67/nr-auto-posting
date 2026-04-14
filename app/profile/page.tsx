'use client';

import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, CreditCard, Zap, Users, Image, Copy, Link } from 'lucide-react';

type TabType = 'profile' | 'pricing' | 'media' | 'affiliate';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
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

  const tabs = [
    { id: 'profile' as TabType, label: 'Личные данные' },
    { id: 'pricing' as TabType, label: 'Тарифы' },
    { id: 'media' as TabType, label: 'Медиатека' },
    { id: 'affiliate' as TabType, label: 'Партнерская программа' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Имя</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Subscription & Credits */}
            <div className="space-y-4">
              <div className="rounded-lg bg-gradient-to-r from-[#8B9A46]/10 to-[#8B9A46]/5 border border-[#8B9A46]/20 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-[#8B9A46]" />
                  <p className="font-medium">Подписка</p>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Текущий план</p>
                <p className="text-lg font-bold text-[#8B9A46]">Бесплатный</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <p className="font-medium">Кредиты</p>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Доступно</p>
                <p className="text-lg font-bold">100</p>
              </div>
            </div>
          </div>
        );
      
      case 'pricing':
        return (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-md text-muted-foreground">Тарифы скоро будут доступны</p>
                <p className="text-xs text-muted-foreground">Мы работаем над новыми тарифными планами.</p>
          </div>
        );
      
      case 'media':
        return (
          <div className="text-center py-12">
            <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-md text-muted-foreground">Медиатека пуста</p>
                <p className="text-xs text-muted-foreground">
                    Здесь будут отображаться &zwj;
                    <button className="underline hover:text-white transition-colors cursor-pointer">
                        ваши созданные
                    </button>
                    &zwj; медиафайлы.
                </p>
          </div>
        );
      
      case 'affiliate':
        return (
          <div className="space-y-4">
            {/* Header */}
            <div className="rounded-lg bg-gradient-to-r from-[#8B9A46]/10 to-[#8B9A46]/5 border border-[#8B9A46]/20 p-4">
              <h3 className="text-xl font-bold mb-2">Партнерская программа</h3>
              <p className="text-sm text-muted-foreground">
                Зарабатывайте до 40% комиссии - присоединяйтесь к партнерской программе, делитесь ссылкой с друзьями и коллегами,
                и начните превращать свой трафик в доход уже сегодня.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-muted/50 border border-border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Партнерские токены</p>
                </div>
                <p className="text-3xl font-bold">0</p>
              </div>

              <div className="rounded-lg bg-muted/50 border border-border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#8B9A46]/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#8B9A46]" />
                  </div>
                  <p className="text-sm text-muted-foreground">Сумма продаж</p>
                </div>
                <p className="text-3xl font-bold">0 ₽</p>
              </div>
            </div>

            {/* Referral Link */}
            <div className="rounded-lg bg-muted/50 border border-border p-6">
              <div className="flex items-center gap-2 mb-3">
                <Link className="w-5 h-5 text-primary" />
                <p className="font-medium">Отправьте вашу уникальную ссылку друзьям/коллегам, чтобы зарабатывать вместе</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value="https://syntx.ai/welcome/vVpxOY4Y"
                  readOnly
                  className="flex-1 px-4 py-2 rounded-md bg-background border border-border text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('https://syntx.ai/welcome/vVpxOY4Y');
                  }}
                  className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  Копировать
                </button>
              </div>
            </div>

            {/* Referrers Table */}
            <div className="rounded-lg bg-muted/50 border border-border">
              <div className="p-4 border-b border-border">
                <h3 className="font-medium">Мои рефералы</h3>
                <p className="text-xs text-muted-foreground mt-1">Самые активные участники</p>
              </div>
              
              {/* Level Stats */}
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground mt-1">Участники</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground mt-1">1 уровень</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground mt-1">2 уровень</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground mt-1">3 уровень</p>
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-background/50 text-sm font-medium text-muted-foreground">
                <div>Уровень</div>
                <div>Выплаты</div>
                <div>Дата регистрации</div>
                <div></div>
              </div>

              {/* Empty State */}
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">Нет данных</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={handleLogout} />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <h1 className="text-lg font-bold">Мой профиль</h1>
          
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="rounded-xl bg-muted/50 p-4">
            {renderContent()}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
