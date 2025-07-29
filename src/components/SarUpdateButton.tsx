import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
const SarUpdateButton = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    toast
  } = useToast();
  const handleSarUpdate = async () => {
    setIsUpdating(true);
    try {
      console.log('بدء تحديث أسعار الريال السعودي يدوياً...');
      const {
        data,
        error
      } = await supabase.functions.invoke('update-sar-prices', {
        body: {
          manual: true,
          source: 'ye-rial.com/aden'
        }
      });
      if (error) {
        throw error;
      }
      console.log('نتيجة تحديث SAR:', data);
      toast({
        title: "✅ تم تحديث الريال السعودي بنجاح",
        description: `تم سحب الأسعار من ye-rial.com/aden وحفظها في قاعدة البيانات`,
        duration: 4000
      });
    } catch (error) {
      console.error('خطأ في تحديث أسعار SAR:', error);
      toast({
        title: "❌ فشل في تحديث الريال السعودي",
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
      onClick={handleSarUpdate}
      disabled={isUpdating}
      variant="outline"
      size="sm"
      className="bg-green-600/20 hover:bg-green-600/30 text-green-100 border-green-400/30 hover:border-green-400/50 transition-all duration-300 shadow-lg backdrop-blur-sm"
    >
      <DollarSign className="w-3 h-3 md:w-4 md:h-4 ml-1" />
      <span className="text-xs md:text-sm font-medium">
        {isUpdating ? 'جاري التحديث...' : 'ريال سعودي'}
      </span>
    </Button>
  );
};
export default SarUpdateButton;