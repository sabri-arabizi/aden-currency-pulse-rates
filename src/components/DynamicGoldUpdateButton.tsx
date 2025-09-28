import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
        
        // عرض النتائج في التوست
        const pricesTable = data.calculatedPrices
          ?.map((price: any) => `${price.carat}: ${price.buyPriceYER.toLocaleString()} (شراء) / ${price.sellPriceYER.toLocaleString()} (بيع)`)
          .join('\n');
        
        toast({
          title: "✅ تم التحديث الديناميكي للذهب",
          description: `تم تحديث ${data.updates?.length || 0} عيار بناءً على أسعار الصرف\n${pricesTable}`,
          duration: 6000,
        });
      } else {
        throw new Error(data?.error || 'فشل في التحديث الديناميكي');
      }
    } catch (error) {
      console.error('❌ خطأ في التحديث الديناميكي:', error);
      toast({
        title: "❌ خطأ في التحديث",
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDynamicUpdate}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <TrendingUp className="h-4 w-4" />
      )}
      {isLoading ? 'جاري التحديث...' : 'تحديث ديناميكي للذهب'}
    </Button>
  );
};