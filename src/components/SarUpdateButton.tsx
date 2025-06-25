
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SarUpdateButton = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleSarUpdate = async () => {
    setIsUpdating(true);
    
    try {
      console.log('بدء تحديث أسعار الريال السعودي يدوياً...');
      
      const { data, error } = await supabase.functions.invoke('update-sar-prices', {
        body: { manual: true, source: 'ye-rial.com/aden' }
      });

      if (error) {
        throw error;
      }

      console.log('نتيجة تحديث SAR:', data);

      toast({
        title: "✅ تم تحديث الريال السعودي بنجاح",
        description: `تم سحب الأسعار من ye-rial.com/aden وحفظها في قاعدة البيانات`,
        duration: 4000,
      });

    } catch (error) {
      console.error('خطأ في تحديث أسعار SAR:', error);
      toast({
        title: "❌ فشل في تحديث الريال السعودي",
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
      onClick={handleSarUpdate}
      disabled={isUpdating}
      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      <DollarSign 
        size={18} 
        className={`ml-2 ${isUpdating ? 'animate-spin' : ''}`} 
      />
      {isUpdating ? 'جاري التحديث...' : 'SAR'}
    </Button>
  );
};

export default SarUpdateButton;
