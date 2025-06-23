
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExchangeRate } from '@/hooks/useExchangeRates';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface CurrencyCardProps {
  rate: ExchangeRate;
}

export const CurrencyCard = ({ rate }: CurrencyCardProps) => {
  const isAutoUpdated = (currencyCode: string) => {
    return ['SAR', 'USD', 'AED', 'EGP'].includes(currencyCode);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA').format(price);
  };

  return (
    <Card className="h-full bg-white border-l-4 border-l-yellow-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <img 
            src={rate.flag_url} 
            alt={rate.currency_name}
            className="w-10 h-7 rounded-sm shadow-md border"
          />
          {isAutoUpdated(rate.currency_code) && (
            <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
              <Clock size={12} className="ml-1" />
              <span className="font-medium">تحديث تلقائي</span>
            </div>
          )}
        </div>
        <CardTitle className="text-xl font-bold text-gray-800 text-right mt-2">
          {rate.currency_name}
        </CardTitle>
        <p className="text-sm text-gray-600 text-right font-medium">{rate.currency_code}</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center border-2 border-green-200 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown size={18} className="text-green-600 ml-1" />
              <span className="text-sm text-green-700 font-bold">شراء</span>
            </div>
            <div className="text-xl font-bold text-green-800">
              {formatPrice(rate.buy_price)}
            </div>
            <div className="text-xs text-green-600 mt-1">ريال يمني</div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl text-center border-2 border-red-200 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp size={18} className="text-red-600 ml-1" />
              <span className="text-sm text-red-700 font-bold">بيع</span>
            </div>
            <div className="text-xl font-bold text-red-800">
              {formatPrice(rate.sell_price)}
            </div>
            <div className="text-xs text-red-600 mt-1">ريال يمني</div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-500">
            آخر تحديث: {new Date(rate.updated_at).toLocaleString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit'
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
