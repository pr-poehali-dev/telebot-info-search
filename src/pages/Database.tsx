import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { api, PhoneRecord } from '@/lib/api';

const Database = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<PhoneRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async (search: string = '') => {
    try {
      setIsLoading(true);
      const data = await api.getPhoneRecords(search);
      setRecords(data);
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить записи',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadRecords(searchQuery);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        loadRecords(searchQuery);
      } else {
        loadRecords();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const activeRecords = records.filter(r => r.status === 'active').length;
  const inactiveRecords = records.filter(r => r.status === 'inactive').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <header className="bg-card/50 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Icon name="Database" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">База данных</h1>
              <p className="text-xs text-muted-foreground">Управление записями</p>
            </div>
          </div>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="gap-2">
            <Icon name="LayoutDashboard" size={18} />
            Дашборд
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-2 bg-gradient-to-br from-primary to-secondary text-white">
            <div className="flex items-center justify-between mb-2">
              <Icon name="FileText" size={32} />
              <span className="text-2xl font-bold">{records.length.toLocaleString()}</span>
            </div>
            <p className="text-sm opacity-90">Всего записей</p>
          </Card>

          <Card className="p-6 border-2 bg-gradient-to-br from-secondary to-accent text-white">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle" size={32} />
              <span className="text-2xl font-bold">{activeRecords}</span>
            </div>
            <p className="text-sm opacity-90">Активных</p>
          </Card>

          <Card className="p-6 border-2 bg-gradient-to-br from-accent to-primary text-white">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Clock" size={32} />
              <span className="text-2xl font-bold">{inactiveRecords}</span>
            </div>
            <p className="text-sm opacity-90">Неактивных</p>
          </Card>
        </div>

        <Card className="p-6 border-2 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск по телефону или имени..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-2"
                />
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="outline" className="gap-2" onClick={() => loadRecords()}>
                <Icon name="RefreshCw" size={18} />
                Обновить
              </Button>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <Card className="p-12 border-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <Icon name="Loader2" size={48} className="animate-spin text-primary" />
              <p className="text-muted-foreground">Загрузка данных...</p>
            </div>
          </Card>
        ) : records.length === 0 ? (
          <Card className="p-12 border-2">
            <div className="text-center">
              <Icon name="SearchX" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Записи не найдены</p>
            </div>
          </Card>
        ) : (
          <Card className="border-2 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">ID</TableHead>
                  <TableHead className="font-bold">Телефон</TableHead>
                  <TableHead className="font-bold">Имя</TableHead>
                  <TableHead className="font-bold">Информация</TableHead>
                  <TableHead className="font-bold">Статус</TableHead>
                  <TableHead className="font-bold">Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">#{record.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon name="Phone" size={16} className="text-primary" />
                        <span className="font-mono">{record.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell className="text-muted-foreground">{record.info}</TableCell>
                    <TableCell>
                      <Badge
                        variant={record.status === 'active' ? 'default' : 'secondary'}
                        className={record.status === 'active' ? 'bg-green-500' : ''}
                      >
                        {record.status === 'active' ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{record.created_at}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Database;
