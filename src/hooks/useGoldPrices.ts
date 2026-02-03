
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
      console.log('⏰ وقت الجلب:', new Date().toISOString());
      
      const { data, error } = await supabase
        .from('gold_prices')
        .select('*')
        .eq('city', selectedCity)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ خطأ في جلب أسعار الذهب:', error);
        throw error;
      }

      console.log('📊 البيانات الخام من قاعدة البيانات:', data?.length, 'سجل');
      
      // تصفية الأنواع المطلوبة فقط
      const validTypes = ['عيار 18', 'عيار 21', 'عيار 22', 'جنيه ذهب'];
      const filteredData = (data || []).filter((gold: GoldPrice) => 
        validTypes.includes(gold.type)
      );

      console.log('📋 البيانات بعد التصفية:', filteredData.length, 'سجل');

      // الحصول على آخر تحديث مسجل
      const lastUpdateTimestamp = getLastUpdateTimestamp(selectedCity);
      console.log('📅 آخر تحديث مسجل:', lastUpdateTimestamp, lastUpdateTimestamp > 0 ? new Date(lastUpdateTimestamp).toISOString() : 'لا يوجد');

      // إذا لم يكن هناك تحديث سابق مسجل
      if (lastUpdateTimestamp === 0) {
        // نتحقق من حداثة البيانات
        const freshData = filteredData.filter((gold: GoldPrice) => isDataFresh(gold.updated_at));
        
        if (freshData.length === 0 && filteredData.length > 0) {
          console.log('⚠️ البيانات قديمة - تحتاج إلى تحديث يدوي');
          return filteredData.map((gold: GoldPrice) => ({
            ...gold,
            _isStale: true
          })) as GoldPrice[];
        }
        
        console.log('✅ البيانات حديثة (بدون تحديث سابق):', freshData.length, 'سجل');
        return freshData as GoldPrice[];
      }

      // إرجاع جميع البيانات المصفاة - React Query سيتكفل بتحديثها
      // لأننا نستخدم invalidateQueries بعد كل تحديث ناجح
      const freshData = filteredData.filter((gold: GoldPrice) => {
        const updateTime = new Date(gold.updated_at).getTime();
        const threshold = lastUpdateTimestamp - (10 * 60 * 1000); // 10 دقائق tolerance
        const isFresh = updateTime >= threshold;
        console.log(`  - ${gold.type}: updated_at=${gold.updated_at}, isFresh=${isFresh}`);
        return isFresh;
      });

      if (freshData.length === 0 && filteredData.length > 0) {
        console.log('⚠️ لا توجد بيانات حديثة كافية، نعرض جميع البيانات المتاحة');
        // بدلاً من إرجاع فارغ، نعرض البيانات المتاحة مع علامة قديمة
        return filteredData.map((gold: GoldPrice) => ({
          ...gold,
          _isStale: true
        })) as GoldPrice[];
      }

      console.log('✅ تم جلب أسعار الذهب الحديثة بنجاح:', freshData.length, 'سجل');
      freshData.forEach(g => console.log(`  📍 ${g.type}: شراء=${g.buy_price}, بيع=${g.sell_price}`));
      
      return freshData as GoldPrice[];
    },
    refetchInterval: false,
    staleTime: 0,
    gcTime: 0,
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
