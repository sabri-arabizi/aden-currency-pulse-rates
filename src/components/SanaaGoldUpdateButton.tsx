import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
export const SanaaGoldUpdateButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 بدء تحديث أسعار الذهب في صنعاء...');
      const {
        data,
        error
      } = await supabase.functions.invoke('update-gold-sanaa-zoza');
      if (error) {
        console.error('❌ خطأ في استدعاء دالة التحديث:', error);
        throw error;
      }
      if (data?.success) {
        console.log('✅ تم التحديث بنجاح:', data);
        toast({
          title: "✅ تم تحديث أسعار الذهب",
          description: `تم تحديث ${data.updatedTypes?.length || 0} عيار من موقع zoza.top`,
          duration: 6000
        });

        // Reload the page to fetch fresh data
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
  return;
};