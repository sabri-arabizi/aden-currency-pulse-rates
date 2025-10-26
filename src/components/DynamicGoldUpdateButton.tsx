import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
export const DynamicGoldUpdateButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleDynamicUpdate = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 بدء التحديث الديناميكي لأسعار الذهب...');
      const {
        data,
        error
      } = await supabase.functions.invoke('update-gold-dynamic-aden');
      if (error) {
        console.error('❌ خطأ في استدعاء دالة التحديث الديناميكي:', error);
        throw error;
      }
      if (data?.success) {
        console.log('✅ تم التحديث الديناميكي بنجاح:', data);
        toast({
          title: "✅ تم التحديث الديناميكي للذهب",
          description: `تم تحديث ${data.updates?.length || 0} عيار بناءً على أسعار الصرف`,
          duration: 6000
        });

        // Reload the page to fetch fresh data
        window.location.reload();
      } else {
        throw new Error(data?.error || 'فشل في التحديث الديناميكي');
      }
    } catch (error) {
      console.error('❌ خطأ في التحديث الديناميكي:', error);
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