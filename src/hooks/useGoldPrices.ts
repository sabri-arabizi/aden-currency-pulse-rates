
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GoldPrice {
  id: string;
  type: string;
  buy_price: number;
  sell_price: number;
  city: string;
  updated_at: string;
  created_at: string;
}

export const useGoldPrices = (selectedCity: string) => {
  return useQuery({
    queryKey: ['gold-prices', selectedCity],
    queryFn: async () => {
      console.log('جاري جلب أسعار الذهب للمدينة:', selectedCity);
      
      const { data, error } = await supabase
        .from('gold_prices')
        .select('*')
        .eq('city', selectedCity)
        .order('type', { ascending: true });

      if (error) {
        console.error('خطأ في جلب أسعار الذهب:', error);
        throw error;
      }

      // Filter to show only 18, 21, 22 karats and gold pound
      const filteredData = (data || []).filter((gold: GoldPrice) => {
        const validTypes = ['عيار 18', 'عيار 21', 'عيار 22', 'جنيه ذهب'];
        return validTypes.includes(gold.type);
      });

      console.log('تم جلب أسعار الذهب بنجاح:', filteredData);
      return filteredData as GoldPrice[];
    },
    refetchInterval: 2 * 60 * 1000, // تحديث كل دقيقتين
    staleTime: 1 * 60 * 1000, // البيانات تعتبر قديمة بعد دقيقة واحدة
  });
};
