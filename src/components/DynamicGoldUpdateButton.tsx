import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import UnityNative from '@/lib/capacitorUnityAds';
import { UNITY_PLACEMENT_REWARDED_ANDROID } from '@/lib/unityAds';

export const DynamicGoldUpdateButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDynamicUpdate = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 بدء التحديث الديناميكي لأسعار الذهب...');
      const { data, error } = await supabase.functions.invoke('update-gold-dynamic-aden');

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

        // Show Rewarded Ad after successful update
        console.log('🎬 Requesting Rewarded Ad...');
        try {
          await UnityNative.showRewarded(UNITY_PLACEMENT_REWARDED_ANDROID);
        } catch (adError) {
          console.error('❌ Failed to show rewarded ad:', adError);
        }

        // Reload the page to fetch fresh data (optional, maybe delay it?)
        // window.location.reload(); 
        // Let's rely on the user or a query invalidation instead of hard reload to allow ad to show.
        // But if we must reload, we should wait. For now, I'll comment out hard reload to let ad show.

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

  return (
    <Button
      onClick={handleDynamicUpdate}
      disabled={isLoading}
      className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border-0 shadow-lg"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <TrendingUp className="w-4 h-4 ml-2" />}
      تحديث الذهب
    </Button>
  );
};