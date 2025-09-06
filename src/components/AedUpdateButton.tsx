import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AedUpdateButton = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleAedUpdate = async () => {
    setIsUpdating(true);
    try {
      console.log('بدء تحديث أسعار الدرهم الإماراتي يدوياً...');
      
      const { data, error } = await supabase.functions.invoke('update-aed-prices', {
        body: {
          manual: true,
          source: 'almashhadalaraby.com'
        }
      });

      if (error) {
        throw error;
      }

      console.log('نتيجة تحديث AED:', data);
      
      const source = data?.source || 'مواقع متعددة';
      const updatedCount = data?.updates?.length || 0;
      
      toast({
        title: "✅ تم تحديث الدرهم الإماراتي بنجاح",
        description: `تم تحديث ${updatedCount} مدينة من ${source}`,
        duration: 4000
      });
      
    } catch (error) {
      console.error('خطأ في تحديث أسعار AED:', error);
      
      toast({
        title: "❌ فشل في تحديث الدرهم الإماراتي",
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
      onClick={handleAedUpdate}
      disabled={isUpdating}
      size="sm"
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <DollarSign className="w-4 h-4 mr-1" />
      {isUpdating ? 'جاري التحديث...' : 'تحديث AED'}
    </Button>
  );
};

export default AedUpdateButton;