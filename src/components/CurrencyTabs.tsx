
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Coins } from 'lucide-react';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useGoldPrices } from '@/hooks/useGoldPrices';
import { CurrencyCard } from './CurrencyCard';
import { GoldCard } from './GoldCard';

interface CurrencyTabsProps {
  selectedCity: string;
}

const CurrencyTabs = ({ selectedCity }: CurrencyTabsProps) => {
  const [activeTab, setActiveTab] = React.useState('currencies');
  const { data: exchangeRates, isLoading: ratesLoading, error: ratesError } = useExchangeRates(selectedCity);
  const { data: goldPrices, isLoading: goldLoading, error: goldError } = useGoldPrices(selectedCity);

  if (ratesLoading || goldLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (ratesError || goldError) {
    return (
      <div className="text-center text-red-500 p-4">
        خطأ في تحميل البيانات
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Tab Headers */}
      <div className="flex bg-gray-100 rounded-t-lg overflow-hidden mb-4">
        <button
          onClick={() => setActiveTab('currencies')}
          className={`flex-1 flex items-center justify-center py-3 px-4 font-medium transition-colors ${
            activeTab === 'currencies'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <DollarSign className="ml-2" size={20} />
          عملات
        </button>
        <button
          onClick={() => setActiveTab('gold')}
          className={`flex-1 flex items-center justify-center py-3 px-4 font-medium transition-colors ${
            activeTab === 'gold'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Coins className="ml-2" size={20} />
          ذهب
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'currencies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exchangeRates?.map((rate) => (
              <CurrencyCard key={`${rate.currency_code}-${rate.city}`} rate={rate} />
            ))}
          </div>
        )}

        {activeTab === 'gold' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goldPrices?.map((gold) => (
              <GoldCard key={`${gold.type}-${gold.city}`} gold={gold} />
            ))}
          </div>
        )}
      </div>

      {/* Update Status */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>آخر تحديث تلقائي: {new Date().toLocaleString('ar-SA')}</p>
        <p className="text-xs mt-1">
          الريال السعودي: ye-rial.com | الدرهم الإماراتي: almashhadalaraby.com
        </p>
      </div>
    </div>
  );
};

export default CurrencyTabs;
