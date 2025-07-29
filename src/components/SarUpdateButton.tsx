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
      size="sm"
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <DollarSign className="w-4 h-4 mr-1" />
      {isUpdating ? 'جاري التحديث...' : 'تحديث SAR'}
    </Button>
  );
};
export default SarUpdateButton;