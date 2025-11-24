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
import UnityRewarded from './UnityRewarded';
import { DynamicGoldUpdateButton } from './DynamicGoldUpdateButton';
import { SanaaGoldUpdateButton } from './SanaaGoldUpdateButton';
import { t } from '@/utils/translations';
interface CurrencyTabsProps {
  selectedCity: string;
  language: 'ar' | 'en';
}
const CurrencyTabs = ({
  selectedCity,
  language
}: CurrencyTabsProps) => {
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
  // (Interstitial for 'gold' tab removed; global interstitial handled in App)
  if (ratesLoading || goldLoading) {
    return <div className="flex justify-center items-center h-40">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent shadow-lg"></div>
          <div className="absolute inset-0 rounded-full border-4 border-yellow-300 animate-ping"></div>
        </div>
      </div>;
  }
  if (ratesError || goldError) {
    return <div className="text-center text-red-400 p-8 bg-red-50/10 rounded-2xl backdrop-blur-sm border border-red-200/20">
        <div className="text-2xl mb-2">⚠️</div>
        <div className="text-lg font-medium">{t('errorLoading', language)}</div>
        <div className="text-sm opacity-75 mt-1">{t('tryAgain', language)}</div>
      </div>;
  }
  const getCityName = (city: string) => {
    if (language === 'en') {
      return city === 'صنعاء' ? 'Sanaa' : 'Aden';
    }
    return city;
  };
  
  // عرض الإعلان البيني عند الانتقال لتبويب الذهب

  return <div className="w-full max-w-7xl py-0 px-0 bg-[#733f27]/55 my-0 mx-0 rounded-none">
          {/* Unity Rewarded will be displayed in the prices (currencies) section after 15s */}
      
      {/* Manual Refresh Button */}
      <div className="flex justify-center mb-8">
        <ManualRefreshButton />
      </div>

      {/* Tab Headers */}
      <div className="flex bg-amber-800/20 backdrop-blur-sm rounded-2xl overflow-hidden mb-8 border border-amber-600/30 shadow-xl">
        <button onClick={() => setActiveTab('currencies')} className={`flex-1 flex items-center justify-center py-4 px-4 font-bold text-sm md:text-lg transition-all duration-300 ${activeTab === 'currencies' ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-amber-700/20'}`}>
          <DollarSign className={language === 'ar' ? 'ml-2' : 'mr-2'} size={20} />
          {t('currencies', language)}
        </button>
        
        <button onClick={() => setActiveTab('gold')} className={`flex-1 flex items-center justify-center py-4 px-4 font-bold text-sm md:text-lg transition-all duration-300 ${activeTab === 'gold' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-amber-700/20'}`}>
          <Coins className={language === 'ar' ? 'ml-2' : 'mr-2'} size={20} />
          {t('gold', language)}
        </button>
        
        <button onClick={() => setActiveTab('converter')} className={`flex-1 flex items-center justify-center py-4 px-4 font-bold text-sm md:text-lg transition-all duration-300 ${activeTab === 'converter' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-amber-700/20'}`}>
          <Calculator className={language === 'ar' ? 'ml-2' : 'mr-2'} size={20} />
          {t('converter', language)}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'currencies' && <>
            {selectedCity === 'صنعاء' && <div className="mb-8">
                <div className="text-center mb-8">
                  <div className="bg-amber-800/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-600/30 shadow-xl mb-6">
                    <h2 className="text-white text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center gap-3">
                      <DollarSign size={32} className="text-yellow-400" />
                      {t('exchangeRates', language)} - {getCityName('صنعاء')}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      
                    </div>
                  </div>
                </div>
                <SanaaCurrencyCards rates={exchangeRates || []} language={language} />
              </div>}
            
            {selectedCity === 'عدن' && <div className="rounded-none">
                <div className="text-center mb-8">
                  <div className="bg-amber-800/20 backdrop-blur-sm p-6 border border-amber-600/30 shadow-xl mb-6 rounded-full">
                    <h2 className="text-white text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center gap-3">
                      <DollarSign size={32} className="text-yellow-400" />
                      {t('exchangeRates', language)} - {getCityName('عدن')}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {exchangeRates?.map(rate => <CurrencyCard key={`${rate.currency_code}-${rate.city}`} rate={rate} language={language} />)}
                </div>
                {/* Unity Rewarded Ad: show in prices section after 15s */}
                <div className="mt-8 flex justify-center">
                  <UnityRewarded
                    delaySeconds={15}
                    autoShow={true}
                    buttonText={language === 'ar' ? 'شاهد إعلان للحصول على مكافأة' : 'Watch Ad for Reward'}
                    onRewardEarned={() => console.log('Reward earned from prices section')}
                  />
                </div>
              </div>}
          </>}

        {activeTab === 'gold' && <div>
            <div className="text-center mb-8">
              <div className="bg-amber-800/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-600/30 shadow-xl mb-6">
                <h2 className="text-white text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center gap-3">
                  <Coins size={32} className="text-yellow-400" />
                  {t('goldPrices', language)} - {getCityName(selectedCity)}
                </h2>
                <div className="flex items-center justify-center gap-2 text-white/80 text-sm mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{language === 'ar' ? 'أسعار حية ومحدثة' : 'Live Updated Prices'}</span>
                </div>
                <div className="flex justify-center">
                  {selectedCity === 'عدن' ? <DynamicGoldUpdateButton /> : <SanaaGoldUpdateButton />}
                </div>
              </div>
            </div>
            {/* Unity Rewarded Ad for Gold section: show 10s after gold tab mounted (after load) */}
            <div className="mt-4 flex justify-center">
              <UnityRewarded
                delaySeconds={10}
                autoShow={true}
                buttonText={language === 'ar' ? 'شاهد إعلان للحصول على مكافأة' : 'Watch Ad for Reward'}
                onRewardEarned={() => console.log('Reward earned from gold prices section')}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {goldPrices?.map(gold => <GoldCard key={`${gold.type}-${gold.city}`} gold={gold} language={language} />)}
            </div>
          </div>}

            {activeTab === 'converter' && <div>
            <div className="text-center mb-8">
              <div className="bg-amber-800/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-600/30 shadow-xl mb-6">
                <h2 className="text-white text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center gap-3">
                  <Calculator size={32} className="text-yellow-400" />
                  {t('currencyConverter', language)} - {getCityName(selectedCity)}
                </h2>
                <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>{t('accurateConversion', language)}</span>
                </div>
              </div>
            </div>
            <CurrencyConverter rates={exchangeRates || []} language={language} />
          </div>}
      </div>

      {/* Enhanced Update Status */}
      <div className="mt-10 text-center">
        <div className="bg-amber-800/10 backdrop-blur-sm rounded-2xl p-6 border border-amber-600/20 shadow-xl">
          <div className="text-white/90 text-lg font-medium mb-4">
            📊 {t('manualUpdate', language)} - {t('lastUpdate', language)}: {new Date().toLocaleString('en-US', {
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
              {selectedCity === 'عدن' && <div className="bg-amber-800/10 p-3 rounded-lg">
                  <div className="font-medium">Aden City</div>
                  
                </div>}
              {selectedCity === 'صنعاء' && <div className="bg-amber-800/10 p-3 rounded-lg">
                  <div className="font-medium">Sanaa City</div>
                  <div className="text-xs">
                    Currencies: ye-rial.com/sanaa<br />
                    Gold: zoza.top
                  </div>
                </div>}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default CurrencyTabs;