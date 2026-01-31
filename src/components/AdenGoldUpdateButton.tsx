import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AdenGoldUpdateButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 بدء تحديث أسعار الذهب في عدن من boqash.com...');
      
      const { data, error } = await supabase.functions.invoke('update-gold-aden-boqash');

      if (error) {
        console.error('❌ خطأ في استدعاء دالة التحديث:', error);
        throw error;
      }

      if (data?.success) {
        console.log('✅ تم التحديث بنجاح:', data);
        toast({
          title: "✅ تم تحديث أسعار الذهب - عدن",
          description: `تم تحديث ${data.updatedTypes?.length || 0} عيار من boqash.com`,
          duration: 6000
        });
        
        // Reload to show fresh data
        window.location.reload();
      } else {
        throw new Error(data?.error || 'فشل في التحديث');
      }
    } catch (error) {
      console.error('❌ خطأ في التحديث:', error);
      toast({
        title: "❌ خطأ في التحديث",
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        variant: "destructive",
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpdate}
      disabled={isLoading}
      className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border-0 shadow-lg"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <TrendingUp className="w-4 h-4 ml-2" />}
      تحديث ذهب عدن
    </Button>
  );
};
