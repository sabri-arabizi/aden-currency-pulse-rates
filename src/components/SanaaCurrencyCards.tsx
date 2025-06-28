import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExchangeRate } from '@/hooks/useExchangeRates';
import { TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react';

interface SanaaCurrencyCardsProps {
  rates: ExchangeRate[];
  language: 'ar' | 'en';
}

const SanaaCurrencyCards = ({ rates, language }: SanaaCurrencyCardsProps) => {
  const formatPrice = (price: number, currencyCode: string) => {
    if (currencyCode === 'USD') {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      }).format(price);
    } else if (currencyCode === 'SAR') {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(price);
    } else {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(price);
    }
  };

  const getCurrencyGradient = (currencyCode: string) => {
    const gradients = {
      'SAR': 'from-green-400 to-emerald-600',
      'USD': 'from-blue-400 to-blue-600',
      'AED': 'from-red-400 to-red-600',
      'EGP': 'from-yellow-400 to-orange-600'
    };
    return gradients[currencyCode as keyof typeof gradients] || 'from-gray-400 to-gray-600';
  };

  const getLastUpdateTime = (updatedAt: string) => {
    const updateTime = new Date(updatedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'Now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      return `${diffHours}h ago`;
    }
  };

  const isAutoUpdated = (currencyCode: string) => {
    return ['SAR', 'USD', 'AED', 'EGP'].includes(currencyCode);
  };

  if (!rates || rates.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-white/60 text-lg">No exchange rate data available</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {rates.map((rate) => (
        <Card 
          key={`${rate.currency_code}-${rate.city}`} 
          className="h-full bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
        >
          <CardHeader className="pb-4 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${getCurrencyGradient(rate.currency_code)} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={rate.flag_url} 
                    alt={rate.currency_name} 
                    className="w-12 h-8 rounded-md shadow-lg border-2 border-white" 
                  />
                  {isAutoUpdated(rate.currency_code) && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <Zap size={10} className="text-white" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <CardTitle className={`text-lg font-bold text-gray-800 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {rate.currency_name}
                  </CardTitle>
                  <p className={`text-sm text-gray-600 ${language === 'ar' ? 'text-right' : 'text-left'} font-medium`}>{rate.currency_code}</p>
                </div>
              </div>

              {isAutoUpdated(rate.currency_code) && (
                <div className="flex items-center text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                  <Clock size={12} className={language === 'ar' ? 'ml-1' : 'mr-1'} />
                  <span className="font-medium">{language === 'ar' ? 'تلقائي' : 'Auto'}</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl text-center border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <TrendingDown size={20} className={`text-green-600 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                  <span className="text-sm text-green-700 font-bold">{language === 'ar' ? 'شراء' : 'Buy'}</span>
                </div>
                <div className="text-2xl font-extrabold text-green-800 mb-1">
                  {formatPrice(rate.buy_price, rate.currency_code)}
                </div>
                <div className="text-xs text-green-600 font-medium">{language === 'ar' ? 'ريال يمني' : 'Yemeni Rial'}</div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-2xl text-center border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <TrendingUp size={20} className={`text-red-600 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                  <span className="text-sm text-red-700 font-bold">{language === 'ar' ? 'بيع' : 'Sell'}</span>
                </div>
                <div className="text-2xl font-extrabold text-red-800 mb-1">
                  {formatPrice(rate.sell_price, rate.currency_code)}
                </div>
                <div className="text-xs text-red-600 font-medium">{language === 'ar' ? 'ريال يمني' : 'Yemeni Rial'}</div>
              </div>
            </div>
            
            <div className="mt-5 text-center">
              <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border">
                {language === 'ar' ? 'آخر تحديث:' : 'Last update:'} {getLastUpdateTime(rate.updated_at)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(rate.updated_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  hour12: true
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SanaaCurrencyCards;
