
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

// تعريف حدود حداثة البيانات: 30 دقيقة كحد أقصى
const DATA_FRESHNESS_THRESHOLD_MINUTES = 30;

// التحقق من حداثة البيانات
export const isDataFresh = (updatedAt: string): boolean => {
  const updateTime = new Date(updatedAt).getTime();
  const now = Date.now();
  const diffMinutes = (now - updateTime) / (1000 * 60);
  return diffMinutes <= DATA_FRESHNESS_THRESHOLD_MINUTES;
};

// التحقق من أن البيانات تم تحديثها بعد timestamp معين
export const isUpdatedAfter = (updatedAt: string, afterTimestamp: number): boolean => {
  const updateTime = new Date(updatedAt).getTime();
  return updateTime > afterTimestamp;
};

// مفتاح تخزين آخر وقت تحديث ناجح في localStorage
const LAST_UPDATE_KEY = 'gold_prices_last_update';

export const setLastUpdateTimestamp = (city: string): void => {
  const key = `${LAST_UPDATE_KEY}_${city}`;
  localStorage.setItem(key, Date.now().toString());
};

export const getLastUpdateTimestamp = (city: string): number => {
  const key = `${LAST_UPDATE_KEY}_${city}`;
  const stored = localStorage.getItem(key);
  return stored ? parseInt(stored, 10) : 0;
};

// مسح البيانات القديمة عند التحديث
export const clearOldGoldData = (city: string): void => {
  const key = `${LAST_UPDATE_KEY}_${city}`;
  localStorage.removeItem(key);
};

export const useGoldPrices = (selectedCity: string) => {
  return useQuery({
    queryKey: ['gold-prices', selectedCity],
    queryFn: async () => {
      console.log('🔍 جاري جلب أسعار الذهب للمدينة:', selectedCity);
      
      const { data, error } = await supabase
        .from('gold_prices')
        .select('*')
        .eq('city', selectedCity)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ خطأ في جلب أسعار الذهب:', error);
        throw error;
      }

      const validTypes = ['عيار 18', 'عيار 21', 'عيار 22', 'جنيه ذهب'];
      const filteredData = (data || []).filter((gold: GoldPrice) => 
        validTypes.includes(gold.type)
      );

      const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      const result = filteredData.map((gold: GoldPrice) => {
        const updateTime = new Date(gold.updated_at).getTime();
        return {
          ...gold,
          _isStale: updateTime <= twentyFourHoursAgo
        };
      });

      console.log('✅ أسعار الذهب:', result.length, 'سجل');
      return result as GoldPrice[];
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchInterval: false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

// دالة لإعادة تعيين الكاش وجلب البيانات الجديدة
export const useRefreshGoldPrices = () => {
  const queryClient = useQueryClient();
  
  const refresh = async (city: string) => {
    // تسجيل وقت التحديث
    setLastUpdateTimestamp(city);
    // إعادة جلب البيانات
    await queryClient.invalidateQueries({ queryKey: ['gold-prices', city] });
  };
  
  return { refresh };
};
