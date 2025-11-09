import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const TELEGRAM_BOT_WEBHOOK = 'https://functions.poehali.dev/2980950f-63b0-4eee-afb2-0743ebbf7608';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [botToken, setBotToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [botInfo, setBotInfo] = useState<any>(null);

  const handleConnectBot = async () => {
    if (!botToken.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите токен бота',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);

    try {
      const botInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const botInfoData = await botInfoResponse.json();

      if (!botInfoData.ok) {
        throw new Error('Неверный токен бота');
      }

      const webhookResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/setWebhook?url=${TELEGRAM_BOT_WEBHOOK}`
      );
      const webhookData = await webhookResponse.json();

      if (webhookData.ok) {
        setBotInfo(botInfoData.result);
        localStorage.setItem('botToken', botToken);
        localStorage.setItem('botInfo', JSON.stringify(botInfoData.result));
        
        toast({
          title: 'Бот подключен! 🎉',
          description: `@${botInfoData.result.username} успешно подключен и готов к работе`,
        });
      } else {
        throw new Error('Не удалось установить webhook');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка подключения',
        description: error.message || 'Проверьте правильность токена',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectBot = () => {
    setBotInfo(null);
    setBotToken('');
    localStorage.removeItem('botToken');
    localStorage.removeItem('botInfo');
    toast({
      title: 'Бот отключен',
      description: 'Telegram бот отключен от системы',
    });
  };

  useState(() => {
    const savedToken = localStorage.getItem('botToken');
    const savedBotInfo = localStorage.getItem('botInfo');
    if (savedToken && savedBotInfo) {
      setBotToken(savedToken);
      setBotInfo(JSON.parse(savedBotInfo));
    }
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано',
      description: `${label} скопирован в буфер обмена`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <header className="bg-card/50 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Icon name="Settings" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Настройки бота</h1>
              <p className="text-xs text-muted-foreground">Подключение Telegram</p>
            </div>
          </div>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="gap-2">
            <Icon name="LayoutDashboard" size={18} />
            Дашборд
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {botInfo ? (
          <Card className="p-8 border-2 mb-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <Icon name="CheckCircle" size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-900">Бот активен!</h2>
                  <p className="text-green-700">@{botInfo.username}</p>
                </div>
              </div>
              <Badge className="bg-green-600">Подключен</Badge>
            </div>

            <div className="bg-white/70 rounded-xl p-6 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Имя бота</p>
                  <p className="font-semibold">{botInfo.first_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ID бота</p>
                  <p className="font-mono font-semibold">{botInfo.id}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Webhook URL</p>
                <div className="flex gap-2">
                  <Input
                    value={TELEGRAM_BOT_WEBHOOK}
                    readOnly
                    className="font-mono text-sm bg-white"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(TELEGRAM_BOT_WEBHOOK, 'Webhook URL')}
                  >
                    <Icon name="Copy" size={18} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2 flex-1"
                onClick={() => window.open(`https://t.me/${botInfo.username}`, '_blank')}
              >
                <Icon name="MessageCircle" size={18} />
                Открыть бота
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={handleDisconnectBot}
              >
                <Icon name="Unplug" size={18} />
                Отключить бота
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-8 border-2 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg flex-shrink-0">
                <Icon name="Bot" size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Подключение Telegram бота</h2>
                <p className="text-muted-foreground">
                  Создайте бота через @BotFather и введите полученный токен для подключения
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="token" className="text-sm font-medium mb-2 block">
                  Токен бота
                </Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="font-mono h-12 border-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Получите токен у <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@BotFather</a>
                </p>
              </div>

              <Button
                onClick={handleConnectBot}
                disabled={isConnecting}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              >
                {isConnecting ? (
                  <>
                    <Icon name="Loader2" size={20} className="animate-spin mr-2" />
                    Подключение...
                  </>
                ) : (
                  <>
                    <Icon name="Link" size={20} className="mr-2" />
                    Подключить бота
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-8 border-2">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Info" size={24} className="text-primary" />
            Инструкция по подключению
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Создайте бота</h4>
                <p className="text-sm text-muted-foreground">
                  Откройте <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@BotFather</a> в Telegram
                  и отправьте команду <code className="bg-muted px-2 py-1 rounded">/newbot</code>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Придумайте имя</h4>
                <p className="text-sm text-muted-foreground">
                  Введите имя бота (например: "PhoneSearch Bot") и уникальный username, который должен заканчиваться на "bot"
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Скопируйте токен</h4>
                <p className="text-sm text-muted-foreground">
                  BotFather отправит вам токен вида <code className="bg-muted px-2 py-1 rounded">123456789:ABCdef...</code>. 
                  Скопируйте его и вставьте в поле выше
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Нажмите "Подключить бота"</h4>
                <p className="text-sm text-muted-foreground">
                  Система автоматически настроит webhook и бот начнет работать. После этого можете протестировать его в Telegram!
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
