import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const CalculatedGoldUpdateButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCalculatedUpdate = async () => {
    try {
      setIsLoading(true);
      
      console.log('🧮 بدء تحديث أسعار الذهب المحسوبة لعدن...');
      
      const { data, error } = await supabase.functions.invoke('update-aden-calculated-gold-prices');
      
      if (error) {
        console.error('❌ خطأ في استدعاء دالة التحديث:', error);
        throw error;
      }

      if (data?.success) {
        console.log('✅ تم تحديث أسعار الذهب المحسوبة بنجاح:', data);
        
        // عرض جدول النتائج في التوست
        const pricesTable = data.calculatedPrices
          .map((price: any) => `${price.carat}: شراء ${price.buyPrice.toLocaleString()}, بيع ${price.sellPrice.toLocaleString()}`)
          .join('\n');
        
        toast({
          title: "✅ تم تحديث أسعار الذهب المحسوبة",
          description: `تم تحديث ${data.updates?.length || 0} عيار بنجاح\n${pricesTable}`,
          duration: 6000,
        });
      } else {
        throw new Error(data?.error || 'فشل في تحديث أسعار الذهب');
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث أسعار الذهب المحسوبة:', error);
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
      onClick={handleCalculatedUpdate}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border-0"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Calculator className="h-4 w-4" />
      )}
      {isLoading ? 'جاري الحساب...' : 'حساب أسعار الذهب'}
    </Button>
  );
};