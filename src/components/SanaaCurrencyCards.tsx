
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExchangeRate } from '@/hooks/useExchangeRates';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface SanaaCurrencyCardsProps {
  rates: ExchangeRate[];
}

const SanaaCurrencyCards = ({ rates }: SanaaCurrencyCardsProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getCurrencyFlag = (currencyCode: string) => {
    switch (currencyCode) {
      case 'SAR':
        return '🇸🇦';
      case 'AED':
        return '🇦🇪';
      case 'USD':
        return '🇺🇸';
      case 'EUR':
        return '🇪🇺';
      case 'EGP':
        return '🇪🇬';
      default:
        return '💱';
    }
  };

  if (!rates || rates.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-white/60 text-lg">لا توجد بيانات أسعار صرف متاحة</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {rates.map((rate) => (
        <Card 
          key={`${rate.currency_code}-${rate.city}`} 
          className="h-full bg-white border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow duration-300"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="text-2xl">{getCurrencyFlag(rate.currency_code)}</div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <CardTitle className="text-lg font-bold text-gray-800 text-right">
              {rate.currency_name}
            </CardTitle>
            <p className="text-sm text-gray-500 text-right">{rate.currency_code}</p>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                <div className="flex items-center justify-center mb-1">
                  <TrendingDown size={16} className="text-green-600 ml-1" />
                  <span className="text-sm text-green-700 font-medium">شراء</span>
                </div>
                <div className="text-lg font-bold text-green-800">
                  {formatPrice(rate.buy_price)}
                </div>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg text-center border border-red-200">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp size={16} className="text-red-600 ml-1" />
                  <span className="text-sm text-red-700 font-medium">بيع</span>
                </div>
                <div className="text-lg font-bold text-red-800">
                  {formatPrice(rate.sell_price)}
                </div>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                <Clock size={12} />
                <span>آخر تحديث</span>
              </div>
              <div className="text-xs text-gray-400 text-center">
                {new Date(rate.updated_at).toLocaleString('en-US', {
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
