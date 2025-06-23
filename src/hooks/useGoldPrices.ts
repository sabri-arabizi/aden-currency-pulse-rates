
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GoldPrice {
  id: string;
  type: string;
  buy_price: number;
  sell_price: number;
  city: string;
  updated_at: string;
}

export const useGoldPrices = (selectedCity: string) => {
  return useQuery({
    queryKey: ['gold-prices', selectedCity],
    queryFn: async () => {
      console.log('Fetching gold prices for city:', selectedCity);
      
      const { data, error } = await supabase
        .from('gold_prices')
        .select('*')
        .eq('city', selectedCity)
        .order('type', { ascending: true });

      if (error) {
        console.error('Error fetching gold prices:', error);
        throw error;
      }

      console.log('Gold prices fetched:', data);
      return data || [];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
