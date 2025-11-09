import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Database = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [records] = useState([
    { id: 1, phone: '+7 (999) 123-45-67', name: 'Иван Петров', info: 'Москва, ул. Ленина 1', status: 'active' },
    { id: 2, phone: '+7 (999) 234-56-78', name: 'Мария Сидорова', info: 'СПб, Невский пр. 10', status: 'active' },
    { id: 3, phone: '+7 (999) 345-67-89', name: 'Алексей Смирнов', info: 'Казань, пр. Победы 5', status: 'inactive' },
    { id: 4, phone: '+7 (999) 456-78-90', name: 'Елена Волкова', info: 'Н.Новгород, ул. Горького 3', status: 'active' },
    { id: 5, phone: '+7 (999) 567-89-01', name: 'Дмитрий Козлов', info: 'Екатеринбург, ул. Мира 7', status: 'active' },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        toast({
          title: 'Файл загружен',
          description: `Обработано записей: ${Math.floor(Math.random() * 1000) + 100}`,
        });
        setIsUploading(false);
      }, 2000);
    }
  };

  const filteredRecords = records.filter(
    (record) =>
      record.phone.includes(searchQuery) ||
      record.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <span className="text-2xl font-bold">{records.filter(r => r.status === 'active').length}</span>
            </div>
            <p className="text-sm opacity-90">Активных</p>
          </Card>

          <Card className="p-6 border-2 bg-gradient-to-br from-accent to-primary text-white">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Clock" size={32} />
              <span className="text-2xl font-bold">{records.filter(r => r.status === 'inactive').length}</span>
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
              <label className="flex-1 md:flex-initial">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2"
                  disabled={isUploading}
                  onClick={() => document.querySelector('input[type="file"]')?.dispatchEvent(new MouseEvent('click'))}
                >
                  {isUploading ? (
                    <Icon name="Loader2" size={18} className="animate-spin" />
                  ) : (
                    <Icon name="Upload" size={18} />
                  )}
                  Загрузить базу
                </Button>
              </label>
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
                <TableHead className="font-bold">ID</TableHead>
                <TableHead className="font-bold">Телефон</TableHead>
                <TableHead className="font-bold">Имя</TableHead>
                <TableHead className="font-bold">Информация</TableHead>
                <TableHead className="font-bold">Статус</TableHead>
                <TableHead className="font-bold text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
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
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <Icon name="SearchX" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Записи не найдены</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Database;
