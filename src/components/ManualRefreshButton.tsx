
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
      console.log('🔄 بدء التحديث الشامل لجميع الأسعار...');

      // Update SAR and USD prices for Aden
      const sarResponse = await supabase.functions.invoke('update-sar-prices', {
        body: { manual: true }
      });

      // Update AED prices for Aden
      const aedResponse = await supabase.functions.invoke('update-aed-prices', {
        body: { manual: true }
      });

      // Update EGP prices for Aden from the new source
      const egpResponse = await supabase.functions.invoke('update-egp-from-2dec', {
        body: { manual: true }
      });

      // Update Gold prices for Aden from new source
      const adenGoldResponse = await supabase.functions.invoke('update-aden-gold-from-souta', {
        body: { manual: true }
      });

      // Update Sanaa exchange rates from khbr.me
      const sanaaRatesResponse = await supabase.functions.invoke('update-sanaa-rates-from-khbr', {
        body: { manual: true }
      });

      // Update Gold prices for both cities from yemennownews
      const goldResponse = await supabase.functions.invoke('update-gold-prices', {
        body: { manual: true }
      });

      console.log('نتائج التحديث الشامل:', { 
        sarResponse, 
        aedResponse, 
        egpResponse, 
        adenGoldResponse,
        sanaaRatesResponse,
        goldResponse 
      });

      toast({
        title: "تم التحديث الشامل بنجاح ✅",
        description: "تم تحديث أسعار جميع العملات والذهب لعدن وصنعاء من المصادر المحدثة",
        duration: 5000,
      });

    } catch (error) {
      console.error('Error refreshing all rates:', error);
      toast({
        title: "خطأ في التحديث الشامل ❌",
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
      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      <RefreshCw 
        size={20} 
        className={`ml-2 ${isRefreshing ? 'animate-spin' : ''}`} 
      />
      {isRefreshing ? 'جاري التحديث الشامل...' : 'تحديث جميع الأسعار'}
    </Button>
  );
};

export default ManualRefreshButton;
