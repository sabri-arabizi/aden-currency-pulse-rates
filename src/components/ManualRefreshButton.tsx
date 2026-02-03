import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { setLastUpdateTimestamp } from '@/hooks/useGoldPrices';
import { useQueryClient } from '@tanstack/react-query';
import UnityAds from '@/integrations/UnityAds';

interface UpdateResult {
  name: string;
  success: boolean;
  error?: string;
}

const ManualRefreshButton = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    // Show Rewarded Ad
    UnityAds.showRewarded().catch(e => console.error("Ad Show Error", e));

    setIsRefreshing(true);

    const results: UpdateResult[] = [];

    try {
      console.log('🔄 بدء التحديث اليدوي لجميع الأسعار...');
      console.log('⏰ وقت بدء التحديث:', new Date().toISOString());

      // الخطوة 1: تحديث أسعار الصرف
      console.log('📊 الخطوة 1: تحديث أسعار الصرف...');

      const exchangePromises = [
        supabase.functions.invoke('update-sar-prices', { body: { manual: true } })
          .then(r => ({ name: 'SAR', success: !r.error, error: r.error?.message }))
          .catch(e => ({ name: 'SAR', success: false, error: e.message })),
        
        supabase.functions.invoke('update-aed-prices', { body: { manual: true } })
          .then(r => ({ name: 'AED', success: !r.error, error: r.error?.message }))
          .catch(e => ({ name: 'AED', success: false, error: e.message })),
        
        supabase.functions.invoke('update-egp-from-2dec', { body: { manual: true } })
          .then(r => ({ name: 'EGP', success: !r.error, error: r.error?.message }))
          .catch(e => ({ name: 'EGP', success: false, error: e.message })),
        
        supabase.functions.invoke('update-sanaa-rates-from-khbr', { body: { manual: true } })
          .then(r => ({ name: 'صنعاء', success: !r.error, error: r.error?.message }))
          .catch(e => ({ name: 'صنعاء', success: false, error: e.message })),
      ];

      const exchangeResults = await Promise.all(exchangePromises);
      results.push(...exchangeResults);
      console.log('✅ نتائج تحديث أسعار الصرف:', exchangeResults);

      // الخطوة 2: تحديث أسعار الذهب - الأهم!
      console.log('💰 الخطوة 2: تحديث أسعار الذهب (أحدث الأسعار فقط)...');

      // تحديث ذهب عدن من boqash.com
      const adenGoldResult = await supabase.functions.invoke('update-gold-aden-boqash', { 
        body: { manual: true, timestamp: Date.now() } 
      });
      
      console.log('📥 استجابة تحديث ذهب عدن:', adenGoldResult);
      
      if (!adenGoldResult.error && adenGoldResult.data?.success) {
        // تسجيل وقت التحديث الناجح لعدن
        const updateTime = Date.now();
        localStorage.setItem('gold_prices_last_update_عدن', updateTime.toString());
        console.log('💾 تم حفظ وقت التحديث لعدن:', updateTime, new Date(updateTime).toISOString());
        results.push({ name: 'ذهب عدن', success: true });
        console.log('✅ تم تحديث ذهب عدن بنجاح:', adenGoldResult.data);
      } else {
        results.push({ name: 'ذهب عدن', success: false, error: adenGoldResult.error?.message });
        console.error('❌ فشل تحديث ذهب عدن:', adenGoldResult.error);
      }

      // تحديث ذهب صنعاء من zoza.top
      const sanaaGoldResult = await supabase.functions.invoke('update-gold-sanaa-zoza', { 
        body: { manual: true, timestamp: Date.now() } 
      });
      
      console.log('📥 استجابة تحديث ذهب صنعاء:', sanaaGoldResult);
      
      if (!sanaaGoldResult.error && sanaaGoldResult.data?.success) {
        // تسجيل وقت التحديث الناجح لصنعاء
        const updateTime = Date.now();
        localStorage.setItem('gold_prices_last_update_صنعاء', updateTime.toString());
        console.log('💾 تم حفظ وقت التحديث لصنعاء:', updateTime, new Date(updateTime).toISOString());
        results.push({ name: 'ذهب صنعاء', success: true });
        console.log('✅ تم تحديث ذهب صنعاء بنجاح:', sanaaGoldResult.data);
      } else {
        results.push({ name: 'ذهب صنعاء', success: false, error: sanaaGoldResult.error?.message });
        console.error('❌ فشل تحديث ذهب صنعاء:', sanaaGoldResult.error);
      }

      console.log('⏰ وقت انتهاء التحديث:', new Date().toISOString());

      // ملخص النتائج
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      console.log('📋 ملخص التحديث:', { successCount, failCount, results });

      // ⚡ الخطوة الحاسمة: إبطال الكاش وإعادة جلب البيانات فوراً
      console.log('🔄 إعادة جلب البيانات من قاعدة البيانات...');
      
      // إبطال جميع استعلامات الذهب
      await queryClient.invalidateQueries({ queryKey: ['gold-prices'] });
      // إبطال جميع استعلامات أسعار الصرف
      await queryClient.invalidateQueries({ queryKey: ['exchange-rates'] });
      
      // إعادة جلب فورية للتأكد
      await queryClient.refetchQueries({ queryKey: ['gold-prices', 'عدن'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['gold-prices', 'صنعاء'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['exchange-rates'], type: 'active' });
      
      console.log('✅ تم إعادة جلب البيانات بنجاح');

      if (failCount === 0) {
        toast({
          title: "✅ تم التحديث بنجاح",
          description: `تم تحديث ${successCount} من الأسعار بأحدث البيانات.`,
          duration: 3000,
        });
      } else {
        toast({
          title: "⚠️ تحديث جزئي",
          description: `نجح: ${successCount} | فشل: ${failCount}`,
          variant: "destructive",
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('❌ خطأ في التحديث اليدوي:', error);
      toast({
        title: "❌ خطأ في التحديث",
        description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      <RefreshCw
        size={20}
        className={`ml-2 ${isRefreshing ? 'animate-spin' : ''}`}
      />
      {isRefreshing ? 'جاري التحديث...' : 'تحديث يدوي (الجدولة متوقفة)'}
    </Button>
  );
};

export default ManualRefreshButton;
