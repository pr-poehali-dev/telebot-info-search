import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

const Users = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const [users] = useState([
    { id: 1, name: 'Александр К.', username: '@alex_k', searches: 45, joined: '15.10.2024', status: 'active', avatar: 'АК' },
    { id: 2, name: 'Мария П.', username: '@maria_p', searches: 123, joined: '12.10.2024', status: 'active', avatar: 'МП' },
    { id: 3, name: 'Дмитрий В.', username: '@dmitry_v', searches: 8, joined: '18.10.2024', status: 'blocked', avatar: 'ДВ' },
    { id: 4, name: 'Елена С.', username: '@elena_s', searches: 67, joined: '10.10.2024', status: 'active', avatar: 'ЕС' },
    { id: 5, name: 'Сергей М.', username: '@sergey_m', searches: 234, joined: '05.10.2024', status: 'active', avatar: 'СМ' },
    { id: 6, name: 'Ольга Н.', username: '@olga_n', searches: 12, joined: '20.10.2024', status: 'active', avatar: 'ОН' },
    { id: 7, name: 'Иван Р.', username: '@ivan_r', searches: 89, joined: '08.10.2024', status: 'inactive', avatar: 'ИР' },
  ]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'blocked':
        return 'bg-red-500';
      case 'inactive':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'blocked':
        return 'Заблокирован';
      case 'inactive':
        return 'Неактивен';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <header className="bg-card/50 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
              <Icon name="Users" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Пользователи бота</h1>
              <p className="text-xs text-muted-foreground">Управление пользователями</p>
            </div>
          </div>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="gap-2">
            <Icon name="LayoutDashboard" size={18} />
            Дашборд
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: 'Users', label: 'Всего пользователей', value: users.length, color: 'from-primary to-secondary' },
            { icon: 'UserCheck', label: 'Активных', value: users.filter(u => u.status === 'active').length, color: 'from-green-500 to-green-600' },
            { icon: 'UserX', label: 'Заблокированных', value: users.filter(u => u.status === 'blocked').length, color: 'from-red-500 to-red-600' },
            { icon: 'UserMinus', label: 'Неактивных', value: users.filter(u => u.status === 'inactive').length, color: 'from-gray-400 to-gray-500' },
          ].map((stat, index) => (
            <Card
              key={index}
              className="p-6 border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon name={stat.icon as any} size={24} className="text-white" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </div>

        <Card className="p-6 border-2 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск по имени или username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-2"
                />
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="outline" className="gap-2">
                <Icon name="Filter" size={18} />
                Фильтры
              </Button>
              <Button variant="outline" className="gap-2">
                <Icon name="Download" size={18} />
                Экспорт
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border-2 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold">Пользователь</TableHead>
                <TableHead className="font-bold">Username</TableHead>
                <TableHead className="font-bold">Поисков</TableHead>
                <TableHead className="font-bold">Дата регистрации</TableHead>
                <TableHead className="font-bold">Статус</TableHead>
                <TableHead className="font-bold text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono">{user.username}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon name="Search" size={14} className="text-primary" />
                      <span className="font-semibold">{user.searches}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.joined}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>
                      {getStatusLabel(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Icon name="Eye" size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Icon name="Ban" size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Icon name="UserX" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Пользователи не найдены</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Users;
