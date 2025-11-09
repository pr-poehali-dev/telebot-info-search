import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { api, PhoneRecord, AdditionalInfo } from '@/lib/api';

const Database = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<PhoneRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PhoneRecord | null>(null);
  
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    additionalInfo: [{ label: '', value: '' }] as AdditionalInfo[],
  });

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

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRecords(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const resetForm = () => {
    setFormData({
      phone: '',
      name: '',
      additionalInfo: [{ label: '', value: '' }],
    });
  };

  const handleAddField = () => {
    setFormData({
      ...formData,
      additionalInfo: [...formData.additionalInfo, { label: '', value: '' }],
    });
  };

  const handleRemoveField = (index: number) => {
    const newFields = formData.additionalInfo.filter((_, i) => i !== index);
    setFormData({ ...formData, additionalInfo: newFields });
  };

  const handleFieldChange = (index: number, field: 'label' | 'value', value: string) => {
    const newFields = [...formData.additionalInfo];
    newFields[index][field] = value;
    setFormData({ ...formData, additionalInfo: newFields });
  };

  const handleAddRecord = async () => {
    if (!formData.phone.trim() || !formData.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const validFields = formData.additionalInfo.filter(f => f.label.trim() && f.value.trim());
      await api.addPhoneRecord(formData.phone, formData.name, '', validFields);
      toast({
        title: 'Запись добавлена',
        description: `${formData.name} успешно добавлен в базу`,
      });
      resetForm();
      setIsAddDialogOpen(false);
      loadRecords(searchQuery);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить запись',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditRecord = async () => {
    if (!selectedRecord || !formData.phone.trim() || !formData.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const validFields = formData.additionalInfo.filter(f => f.label.trim() && f.value.trim());
      await api.updatePhoneRecord(
        selectedRecord.id,
        formData.phone,
        formData.name,
        '',
        selectedRecord.status,
        validFields
      );
      toast({
        title: 'Запись обновлена',
        description: 'Изменения успешно сохранены',
      });
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      loadRecords(searchQuery);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить запись',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;

    try {
      setIsSaving(true);
      await api.deletePhoneRecord(selectedRecord.id);
      toast({
        title: 'Запись удалена',
        description: 'Запись успешно удалена из базы',
      });
      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
      loadRecords(searchQuery);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить запись',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (record: PhoneRecord) => {
    setSelectedRecord(record);
    setFormData({
      phone: record.phone,
      name: record.name,
      additionalInfo: record.additional_info?.length > 0 
        ? record.additional_info 
        : [{ label: '', value: '' }],
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (record: PhoneRecord) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Телефон', 'Имя', 'Доп. информация', 'Статус', 'Дата'];
    const csvContent = [
      headers.join(','),
      ...records.map(r => {
        const additionalInfoStr = r.additional_info
          ?.map(info => `${info.label}: ${info.value}`)
          .join('; ') || '';
        return [r.id, r.phone, r.name, `"${additionalInfoStr}"`, r.status, r.created_at].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `phone_records_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Экспорт завершён',
      description: `Экспортировано ${records.length} записей`,
    });
  };

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
            <div className="flex gap-3 w-full md:w-auto flex-wrap">
              <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-primary to-secondary">
                    <Icon name="Plus" size={18} />
                    Добавить
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <Icon name="UserPlus" size={24} className="text-primary" />
                      Новая запись
                    </DialogTitle>
                    <DialogDescription>
                      Добавьте новый контакт в базу данных
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Телефон <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        placeholder="+7 (999) 123-45-67"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-11 border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Имя <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Иван Иванов"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-11 border-2"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Дополнительная информация</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddField}
                          className="gap-2"
                        >
                          <Icon name="Plus" size={16} />
                          Добавить поле
                        </Button>
                      </div>
                      {formData.additionalInfo.map((field, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Название (Адрес, VK, Email...)"
                            value={field.label}
                            onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                            className="h-10 border-2"
                          />
                          <Input
                            placeholder="Значение"
                            value={field.value}
                            onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                            className="h-10 border-2 flex-1"
                          />
                          {formData.additionalInfo.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveField(index)}
                            >
                              <Icon name="X" size={18} />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => { setIsAddDialogOpen(false); resetForm(); }}
                      disabled={isSaving}
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={handleAddRecord}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      {isSaving ? (
                        <>
                          <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Icon name="Save" size={18} className="mr-2" />
                          Сохранить
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="gap-2" onClick={exportToCSV}>
                <Icon name="Download" size={18} />
                Экспорт CSV
              </Button>
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
                  <TableHead className="font-bold">Доп. информация</TableHead>
                  <TableHead className="font-bold">Статус</TableHead>
                  <TableHead className="font-bold">Дата</TableHead>
                  <TableHead className="font-bold text-right">Действия</TableHead>
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
                    <TableCell className="text-muted-foreground text-sm">
                      {record.additional_info && record.additional_info.length > 0 ? (
                        <div className="space-y-1">
                          {record.additional_info.map((info, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="font-medium">{info.label}:</span>
                              <span>{info.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={record.status === 'active' ? 'default' : 'secondary'}
                        className={record.status === 'active' ? 'bg-green-500' : ''}
                      >
                        {record.status === 'active' ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{record.created_at}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(record)}
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(record)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Icon name="Edit" size={24} className="text-primary" />
              Редактирование записи
            </DialogTitle>
            <DialogDescription>
              Измените данные контакта
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-phone">
                Телефон <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-phone"
                placeholder="+7 (999) 123-45-67"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-11 border-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Имя <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="Иван Иванов"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 border-2"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Дополнительная информация</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddField}
                  className="gap-2"
                >
                  <Icon name="Plus" size={16} />
                  Добавить поле
                </Button>
              </div>
              {formData.additionalInfo.map((field, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Название"
                    value={field.label}
                    onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                    className="h-10 border-2"
                  />
                  <Input
                    placeholder="Значение"
                    value={field.value}
                    onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                    className="h-10 border-2 flex-1"
                  />
                  {formData.additionalInfo.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveField(index)}
                    >
                      <Icon name="X" size={18} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button
              onClick={handleEditRecord}
              disabled={isSaving}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-destructive" />
              Удаление записи
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить запись <strong>{selectedRecord?.name}</strong>?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRecord}
              disabled={isSaving}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                  Удаление...
                </>
              ) : (
                'Удалить'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Database;
