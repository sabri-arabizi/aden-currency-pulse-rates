
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ManualRefreshButton = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      console.log('🔄 بدء التحديث اليدوي لجميع الأسعار...');

      // Step 1: Update all exchange rates first
      console.log('📊 الخطوة 1: تحديث أسعار الصرف...');
      
      const sarResponse = await supabase.functions.invoke('update-sar-prices', {
        body: { manual: true }
      });

      const aedResponse = await supabase.functions.invoke('update-aed-prices', {
        body: { manual: true }
      });

      const egpResponse = await supabase.functions.invoke('update-egp-from-2dec', {
        body: { manual: true }
      });

      const sanaaRatesResponse = await supabase.functions.invoke('update-sanaa-rates-from-khbr', {
        body: { manual: true }
      });

      console.log('✅ تم تحديث أسعار الصرف بنجاح');

      // Step 2: Update dynamic gold prices based on new exchange rates
      console.log('💰 الخطوة 2: تحديث أسعار الذهب الديناميكي لعدن...');
      
      const dynamicGoldResponse = await supabase.functions.invoke('update-gold-dynamic-aden', {
        body: { manual: true }
      });

      console.log('✅ تم تحديث أسعار الذهب الديناميكي بنجاح');

      // Step 3: Update gold prices from external sources
      console.log('📰 الخطوة 3: تحديث أسعار الذهب من المصادر الخارجية...');
      
      const goldResponse = await supabase.functions.invoke('update-gold-prices', {
        body: { manual: true }
      });

      console.log('✅ اكتمل التحديث اليدوي بنجاح');

      console.log('نتائج التحديث اليدوي:', { 
        sarResponse, 
        aedResponse, 
        egpResponse,
        sanaaRatesResponse,
        goldResponse,
        dynamicGoldResponse 
      });

      toast({
        title: "تم التحديث اليدوي بنجاح ✅",
        description: "تم تحديث أسعار جميع العملات والذهب الديناميكي يدوياً (الجدولة التلقائية متوقفة)",
        duration: 5000,
      });

    } catch (error) {
      console.error('Error in manual refresh:', error);
      toast({
        title: "خطأ في التحديث اليدوي ❌",
        description: "حدث خطأ أثناء تحديث بعض الأسعار",
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
      {isRefreshing ? 'جاري التحديث اليدوي...' : 'تحديث يدوي (الجدولة متوقفة)'}
    </Button>
  );
};

export default ManualRefreshButton;
