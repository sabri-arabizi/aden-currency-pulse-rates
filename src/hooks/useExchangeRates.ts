
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ExchangeRate {
  id: string;
  currency_code: string;
  currency_name: string;
  buy_price: number;
  sell_price: number;
  flag_url: string;
  city: string;
  updated_at: string;
}

export const useExchangeRates = (selectedCity: string) => {
  return useQuery({
    queryKey: ['exchange-rates', selectedCity],
    queryFn: async () => {
      console.log('Fetching exchange rates for city:', selectedCity);
      
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('city', selectedCity)
        .order('currency_code', { ascending: true });

      if (error) {
        console.error('Error fetching exchange rates:', error);
        throw error;
      }

      console.log('Exchange rates fetched:', data);
      
      // ترتيب العملات: SAR, USD, AED, EGP ثم باقي العملات
      const sortedData = data?.sort((a, b) => {
        const priorityOrder = { 'SAR': 1, 'USD': 2, 'AED': 3, 'EGP': 4 };
        const aPriority = priorityOrder[a.currency_code as keyof typeof priorityOrder] || 999;
        const bPriority = priorityOrder[b.currency_code as keyof typeof priorityOrder] || 999;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        return a.currency_code.localeCompare(b.currency_code);
      });

      return sortedData || [];
    },
    refetchInterval: 2 * 60 * 1000, // تحديث كل دقيقتين
  });
};
