
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Coins } from 'lucide-react';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useGoldPrices } from '@/hooks/useGoldPrices';
import { CurrencyCard } from './CurrencyCard';
import { GoldCard } from './GoldCard';
import ManualRefreshButton from './ManualRefreshButton';

interface CurrencyTabsProps {
  selectedCity: string;
}

const CurrencyTabs = ({ selectedCity }: CurrencyTabsProps) => {
  const [activeTab, setActiveTab] = React.useState('currencies');
  const { data: exchangeRates, isLoading: ratesLoading, error: ratesError } = useExchangeRates(selectedCity);
  const { data: goldPrices, isLoading: goldLoading, error: goldError } = useGoldPrices(selectedCity);

  if (ratesLoading || goldLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent shadow-lg"></div>
          <div className="absolute inset-0 rounded-full border-4 border-purple-300 animate-ping"></div>
        </div>
      </div>
    );
  }

  if (ratesError || goldError) {
    return (
      <div className="text-center text-red-400 p-8 bg-red-50/10 rounded-2xl backdrop-blur-sm border border-red-200/20">
        <div className="text-2xl mb-2">⚠️</div>
        <div className="text-lg font-medium">خطأ في تحميل البيانات</div>
        <div className="text-sm opacity-75 mt-1">يرجى المحاولة مرة أخرى</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Manual Refresh Button */}
      <div className="flex justify-center mb-8">
        <ManualRefreshButton />
      </div>

      {/* Tab Headers */}
      <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden mb-8 border border-white/20 shadow-xl">
        <button
          onClick={() => setActiveTab('currencies')}
          className={`flex-1 flex items-center justify-center py-4 px-6 font-bold text-lg transition-all duration-300 ${
            activeTab === 'currencies'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <DollarSign className="ml-3" size={24} />
          العملات الأجنبية
        </button>
        <button
          onClick={() => setActiveTab('gold')}
          className={`flex-1 flex items-center justify-center py-4 px-6 font-bold text-lg transition-all duration-300 ${
            activeTab === 'gold'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <Coins className="ml-3" size={24} />
          أسعار الذهب
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'currencies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {exchangeRates?.map((rate) => (
              <CurrencyCard key={`${rate.currency_code}-${rate.city}`} rate={rate} />
            ))}
          </div>
        )}

        {activeTab === 'gold' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {goldPrices?.map((gold) => (
              <GoldCard key={`${gold.type}-${gold.city}`} gold={gold} />
            ))}
          </div>
        )}
      </div>

      {/* Update Status */}
      <div className="mt-10 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="text-white/90 text-lg font-medium mb-2">
            📊 آخر تحديث تلقائي: {new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit', 
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </div>
          <div className="text-white/70 text-sm space-y-1">
            <p>🔄 الريال السعودي والدولار: ye-rial.com (كل ساعة)</p>
            <p>🔄 الدرهم الإماراتي: almashhadalaraby.com (كل ساعة)</p>
            <p>🔄 الجنيه المصري: khbr.me (كل ساعة)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyTabs;
