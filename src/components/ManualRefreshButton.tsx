
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
      // Update SAR and USD prices
      const sarResponse = await supabase.functions.invoke('update-sar-prices', {
        body: { manual: true }
      });

      // Update AED prices
      const aedResponse = await supabase.functions.invoke('update-aed-prices', {
        body: { manual: true }
      });

      // Update EGP prices from the new source
      const egpResponse = await supabase.functions.invoke('update-egp-from-2dec', {
        body: { manual: true }
      });

      console.log('نتائج التحديث:', { sarResponse, aedResponse, egpResponse });

      toast({
        title: "تم التحديث بنجاح ✅",
        description: "تم تحديث أسعار جميع العملات من المصادر المحدثة",
      });

    } catch (error) {
      console.error('Error refreshing rates:', error);
      toast({
        title: "خطأ في التحديث ❌",
        description: "حدث خطأ أثناء تحديث الأسعار",
        variant: "destructive",
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
      {isRefreshing ? 'جاري التحديث...' : 'تحديث الأسعار يدوياً'}
    </Button>
  );
};

export default ManualRefreshButton;
