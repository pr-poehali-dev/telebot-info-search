import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats] = useState({
    totalUsers: 1247,
    totalSearches: 8934,
    databaseRecords: 45632,
    activeToday: 89,
  });

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  const quickActions = [
    { icon: 'Database', label: 'База данных', path: '/database', color: 'from-primary to-secondary' },
    { icon: 'Users', label: 'Пользователи', path: '/users', color: 'from-secondary to-accent' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <header className="bg-card/50 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Icon name="Search" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">PhoneSearch Bot</h1>
              <p className="text-xs text-muted-foreground">Панель управления</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <Icon name="LogOut" size={18} />
            Выйти
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 animate-slide-up">
          <h2 className="text-3xl font-bold mb-2">Добро пожаловать! 👋</h2>
          <p className="text-muted-foreground">Обзор активности бота и статистики</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: 'Users', label: 'Всего пользователей', value: stats.totalUsers, color: 'bg-gradient-to-br from-primary to-secondary', trend: '+12%' },
            { icon: 'Search', label: 'Поисковых запросов', value: stats.totalSearches, color: 'bg-gradient-to-br from-secondary to-accent', trend: '+8%' },
            { icon: 'Database', label: 'Записей в базе', value: stats.databaseRecords, color: 'bg-gradient-to-br from-accent to-primary', trend: '+156' },
            { icon: 'Activity', label: 'Активных сегодня', value: stats.activeToday, color: 'bg-gradient-to-br from-primary/80 to-secondary/80', trend: '89' },
          ].map((stat, index) => (
            <Card
              key={index}
              className="p-6 border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center shadow-lg`}>
                  <Icon name={stat.icon as any} size={24} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
            </Card>
          ))}
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Быстрые действия</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="p-8 border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                onClick={() => navigate(action.path)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon name={action.icon as any} size={32} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-1">{action.label}</h4>
                    <p className="text-sm text-muted-foreground">Управление и просмотр</p>
                  </div>
                  <Icon name="ChevronRight" size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-8 border-2 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Icon name="Info" size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Информация о системе</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Телеграм-бот для поиска информации по номерам телефонов. Админ-панель позволяет управлять базой данных и пользователями бота.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">Версия 1.0</span>
                <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full font-medium">Система активна</span>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
