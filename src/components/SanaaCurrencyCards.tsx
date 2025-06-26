
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ExchangeRate } from '@/hooks/useExchangeRates';
import { Clock } from 'lucide-react';

interface SanaaCurrencyCardsProps {
  rates: ExchangeRate[];
}

const SanaaCurrencyCards = ({ rates }: SanaaCurrencyCardsProps) => {
  const formatPrice = (price: number, currencyCode: string) => {
    if (currencyCode === 'USD') {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    } else {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    }
  };

  const getCurrencyIcon = (currencyCode: string) => {
    switch (currencyCode) {
      case 'SAR': return '🇸🇦';
      case 'AED': return '🇦🇪';
      case 'USD': return '🇺🇸';
      case 'EUR': return '🇪🇺';
      case 'EGP': return '🇪🇬';
      default: return '💱';
    }
  };

  const getCurrencyColor = (currencyCode: string) => {
    switch (currencyCode) {
      case 'SAR': return 'from-green-500 to-green-600';
      case 'AED': return 'from-red-500 to-red-600';
      case 'USD': return 'from-blue-500 to-blue-600';
      case 'EUR': return 'from-yellow-500 to-yellow-600';
      case 'EGP': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {rates.map((rate) => (
        <Card key={`${rate.currency_code}-${rate.city}`} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 bg-gradient-to-r ${getCurrencyColor(rate.currency_code)} rounded-lg flex items-center justify-center text-white font-bold shadow-lg`}>
                <span className="text-lg">{getCurrencyIcon(rate.currency_code)}</span>
              </div>
              <div className="text-green-500 text-sm font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                مباشر
              </div>
            </div>
            
            <div className="text-right">
              <h3 className="text-lg font-bold text-gray-800">{rate.currency_name}</h3>
              <p className="text-sm text-gray-600 font-medium">{rate.currency_code}</p>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-green-50 p-4 rounded-xl text-center border-2 border-green-100">
                <div className="text-sm text-green-700 font-medium mb-1">شراء</div>
                <div className="text-2xl font-bold text-green-800">
                  {formatPrice(rate.buy_price, rate.currency_code)}
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-xl text-center border-2 border-red-100">
                <div className="text-sm text-red-700 font-medium mb-1">بيع</div>
                <div className="text-2xl font-bold text-red-800">
                  {formatPrice(rate.sell_price, rate.currency_code)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
              <Clock size={12} />
              <span>آخر تحديث: {new Date(rate.updated_at).toLocaleString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                hour12: true
              })}</span>
            </div>
            
            <div className="text-center mt-2">
              <div className="text-xs text-gray-400">خبر نت</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SanaaCurrencyCards;
