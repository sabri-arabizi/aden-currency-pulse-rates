
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExchangeRate } from '@/hooks/useExchangeRates';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface CurrencyCardProps {
  rate: ExchangeRate;
}

export const CurrencyCard = ({ rate }: CurrencyCardProps) => {
  const getUpdateSource = (currencyCode: string) => {
    switch (currencyCode) {
      case 'SAR':
        return 'ye-rial.com';
      case 'AED':
        return 'almashhadalaraby.com';
      default:
        return 'تحديث يدوي';
    }
  };

  const isAutoUpdated = (currencyCode: string) => {
    return currencyCode === 'SAR' || currencyCode === 'AED';
  };

  return (
    <Card className="h-full bg-white border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <img 
            src={rate.flag_url} 
            alt={rate.currency_name}
            className="w-8 h-6 rounded-sm shadow-sm"
          />
          {isAutoUpdated(rate.currency_code) && (
            <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <Clock size={12} className="ml-1" />
              تحديث تلقائي
            </div>
          )}
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
              {rate.buy_price.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg text-center border border-red-200">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp size={16} className="text-red-600 ml-1" />
              <span className="text-sm text-red-700 font-medium">بيع</span>
            </div>
            <div className="text-lg font-bold text-red-800">
              {rate.sell_price.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-400 text-center">
          المصدر: {getUpdateSource(rate.currency_code)}
        </div>
        <div className="text-xs text-gray-400 text-center">
          آخر تحديث: {new Date(rate.updated_at).toLocaleTimeString('ar-SA')}
        </div>
      </CardContent>
    </Card>
  );
};
