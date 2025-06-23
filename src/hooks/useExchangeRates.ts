
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
      
      // Sort currencies with SAR first, then AED, then others alphabetically
      const sortedData = data?.sort((a, b) => {
        if (a.currency_code === 'SAR') return -1;
        if (b.currency_code === 'SAR') return 1;
        if (a.currency_code === 'AED') return -1;
        if (b.currency_code === 'AED') return 1;
        return a.currency_code.localeCompare(b.currency_code);
      });

      return sortedData || [];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
