
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const GoldUpdateButton = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleGoldUpdate = async () => {
    setIsUpdating(true);
    
    try {
      console.log('🥇 بدء تحديث أسعار الذهب يدوياً...');
      
      const { data, error } = await supabase.functions.invoke('update-gold-prices', {
        body: { manual: true, source: 'yemennownews.com' }
      });

      if (error) {
        throw error;
      }

      console.log('نتيجة تحديث الذهب:', data);

      toast({
        title: "✅ تم تحديث أسعار الذهب بنجاح",
        description: `تم سحب الأسعار من yemennownews.com وحفظها في قاعدة البيانات`,
        duration: 4000,
      });

    } catch (error) {
      console.error('خطأ في تحديث أسعار الذهب:', error);
      toast({
        title: "❌ فشل في تحديث أسعار الذهب",
        description: "حدث خطأ أثناء سحب الأسعار من الموقع",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      onClick={handleGoldUpdate}
      disabled={isUpdating}
      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      <Coins 
        size={18} 
        className={`ml-2 ${isUpdating ? 'animate-spin' : ''}`} 
      />
      {isUpdating ? 'جاري التحديث...' : 'GOLD'}
    </Button>
  );
};

export default GoldUpdateButton;
