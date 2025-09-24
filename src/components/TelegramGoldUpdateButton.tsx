import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TelegramGoldUpdateButton = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleGoldUpdate = async () => {
    setIsUpdating(true);
    try {
      console.log('🥇 بدء تحديث أسعار الذهب من قناة Telegram...');
      
      const { data, error } = await supabase.functions.invoke('update-aden-gold-from-telegram', {
        body: {
          manual: true,
          source: 'telegram-goldpricesyemen'
        }
      });

      if (error) {
        throw error;
      }

      console.log('نتيجة تحديث الذهب من Telegram:', data);
      
      toast({
        title: "✅ تم تحديث أسعار الذهب بنجاح",
        description: `تم سحب الأسعار من قناة Telegram @goldpricesyemen وحفظها في قاعدة البيانات`,
        duration: 4000
      });
    } catch (error) {
      console.error('خطأ في تحديث أسعار الذهب من Telegram:', error);
      
      toast({
        title: "❌ فشل في تحديث أسعار الذهب",
        description: "حدث خطأ أثناء سحب الأسعار من قناة Telegram",
        variant: "destructive",
        duration: 4000
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      onClick={handleGoldUpdate}
      disabled={isUpdating}
      size="sm"
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <MessageCircle className="w-4 h-4 mr-1" />
      {isUpdating ? 'جاري التحديث...' : 'تحديث من Telegram'}
    </Button>
  );
};

export default TelegramGoldUpdateButton;