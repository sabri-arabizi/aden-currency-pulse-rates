import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
const GoldUpdateButton = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    toast
  } = useToast();
  const handleGoldUpdate = async () => {
    setIsUpdating(true);
    try {
      console.log('🥇 بدء تحديث أسعار الذهب يدوياً...');
      const {
        data,
        error
      } = await supabase.functions.invoke('update-gold-prices', {
        body: {
          manual: true,
          source: 'yemennownews.com'
        }
      });
      if (error) {
        throw error;
      }
      console.log('نتيجة تحديث الذهب:', data);
      toast({
        title: "✅ تم تحديث أسعار الذهب بنجاح",
        description: `تم سحب الأسعار من yemennownews.com وحفظها في قاعدة البيانات`,
        duration: 4000
      });
    } catch (error) {
      console.error('خطأ في تحديث أسعار الذهب:', error);
      toast({
        title: "❌ فشل في تحديث أسعار الذهب",
        description: "حدث خطأ أثناء سحب الأسعار من الموقع",
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
      variant="outline"
      size="sm"
      className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-100 border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-300 shadow-lg backdrop-blur-sm"
    >
      <Coins className="w-3 h-3 md:w-4 md:h-4 ml-1" />
      <span className="text-xs md:text-sm font-medium">
        {isUpdating ? 'جاري التحديث...' : 'ذهب'}
      </span>
    </Button>
  );
};
export default GoldUpdateButton;