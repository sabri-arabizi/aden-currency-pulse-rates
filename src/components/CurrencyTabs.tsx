
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Coins, Calculator } from 'lucide-react';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useGoldPrices } from '@/hooks/useGoldPrices';
import { CurrencyCard } from './CurrencyCard';
import { GoldCard } from './GoldCard';
import SanaaCurrencyCards from './SanaaCurrencyCards';
import CurrencyConverter from './CurrencyConverter';
import ManualRefreshButton from './ManualRefreshButton';

interface CurrencyTabsProps {
  selectedCity: string;
}

const CurrencyTabs = ({ selectedCity }: CurrencyTabsProps) => {
  const [activeTab, setActiveTab] = React.useState('currencies');
  
  const {
    data: exchangeRates,
    isLoading: ratesLoading,
    error: ratesError
  } = useExchangeRates(selectedCity);
  
  const {
    data: goldPrices,
    isLoading: goldLoading,
    error: goldError
  } = useGoldPrices(selectedCity);

  if (ratesLoading || goldLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent shadow-lg"></div>
          <div className="absolute inset-0 rounded-full border-4 border-yellow-300 animate-ping"></div>
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
      <div className="flex bg-amber-800/20 backdrop-blur-sm rounded-2xl overflow-hidden mb-8 border border-amber-600/30 shadow-xl">
        <button
          onClick={() => setActiveTab('currencies')}
          className={`flex-1 flex items-center justify-center py-4 px-4 font-bold text-sm md:text-lg transition-all duration-300 ${
            activeTab === 'currencies'
              ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg'
              : 'text-white/80 hover:text-white hover:bg-amber-700/20'
          }`}
        >
          <DollarSign className="ml-2" size={20} />
          العملات الأجنبية
        </button>
        <button
          onClick={() => setActiveTab('gold')}
          className={`flex-1 flex items-center justify-center py-4 px-4 font-bold text-sm md:text-lg transition-all duration-300 ${
            activeTab === 'gold'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
              : 'text-white/80 hover:text-white hover:bg-amber-700/20'
          }`}
        >
          <Coins className="ml-2" size={20} />
          أسعار الذهب
        </button>
        <button
          onClick={() => setActiveTab('converter')}
          className={`flex-1 flex items-center justify-center py-4 px-4 font-bold text-sm md:text-lg transition-all duration-300 ${
            activeTab === 'converter'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
              : 'text-white/80 hover:text-white hover:bg-amber-700/20'
          }`}
        >
          <Calculator className="ml-2" size={20} />
          التحويل
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'currencies' && (
          <>
            {selectedCity === 'صنعاء' && (
              <div className="mb-8">
                <div className="text-center mb-8">
                  <div className="bg-amber-800/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-600/30 shadow-xl mb-6">
                    <h2 className="text-white text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center gap-3">
                      <DollarSign size={32} className="text-yellow-400" />
                      Exchange Rates - Sanaa City
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Source: ye-rial.com/sanaa</span>
                    </div>
                  </div>
                </div>
                <SanaaCurrencyCards rates={exchangeRates || []} />
              </div>
            )}
            
            {selectedCity === 'عدن' && (
              <div>
                <div className="text-center mb-8">
                  <div className="bg-amber-800/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-600/30 shadow-xl mb-6">
                    <h2 className="text-white text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center gap-3">
                      <DollarSign size={32} className="text-yellow-400" />
                      Exchange Rates - Aden City
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Source: ye-rial.com</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {exchangeRates?.map((rate) => (
                    <CurrencyCard key={`${rate.currency_code}-${rate.city}`} rate={rate} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'gold' && (
          <div>
            <div className="text-center mb-8">
              <div className="bg-amber-800/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-600/30 shadow-xl mb-6">
                <h2 className="text-white text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center gap-3">
                  <Coins size={32} className="text-yellow-400" />
                  Gold Prices - {selectedCity}
                </h2>
                <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>
                    {selectedCity === 'عدن' ? 'Source: soutalmukawama.com' : 'Source: yemennownews.com'}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {goldPrices?.map((gold) => (
                <GoldCard key={`${gold.type}-${gold.city}`} gold={gold} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'converter' && (
          <div>
            <div className="text-center mb-8">
              <div className="bg-amber-800/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-600/30 shadow-xl mb-6">
                <h2 className="text-white text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center gap-3">
                  <Calculator size={32} className="text-yellow-400" />
                  Currency Converter - {selectedCity}
                </h2>
                <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Accurate currency conversion based on live rates</span>
                </div>
              </div>
            </div>
            <CurrencyConverter rates={exchangeRates || []} />
          </div>
        )}
      </div>

      {/* Enhanced Update Status */}
      <div className="mt-10 text-center">
        <div className="bg-amber-800/10 backdrop-blur-sm rounded-2xl p-6 border border-amber-600/20 shadow-xl">
          <div className="text-white/90 text-lg font-medium mb-4">
            📊 Manual Update System - Last Update: {new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </div>
          <div className="text-white/70 text-sm space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCity === 'عدن' && (
                <div className="bg-amber-800/10 p-3 rounded-lg">
                  <div className="font-medium">Aden City</div>
                  <div className="text-xs">
                    Currencies: ye-rial.com/aden • 2dec.net<br />
                    Gold: soutalmukawama.com/cat/5
                  </div>
                </div>
              )}
              {selectedCity === 'صنعاء' && (
                <div className="bg-amber-800/10 p-3 rounded-lg">
                  <div className="font-medium">Sanaa City</div>
                  <div className="text-xs">
                    Currencies: ye-rial.com/sanaa<br />
                    Gold: yemennownews.com
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyTabs;
