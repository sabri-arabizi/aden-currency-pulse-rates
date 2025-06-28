
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoldPrice } from '@/hooks/useGoldPrices';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface GoldCardProps {
  gold: GoldPrice;
  language: 'ar' | 'en';
}

export const GoldCard = ({ gold, language }: GoldCardProps) => {
  return (
    <Card className="h-full bg-white border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="w-8 h-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-sm shadow-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">Au</span>
          </div>
        </div>
        <CardTitle className={`text-lg font-bold text-gray-800 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          {language === 'ar' ? `ذهب ${gold.type}` : `Gold ${gold.type}`}
        </CardTitle>
        <p className={`text-sm text-gray-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{gold.type}</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
            <div className="flex items-center justify-center mb-1">
              <TrendingDown size={16} className={`text-green-600 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
              <span className="text-sm text-green-700 font-medium">{language === 'ar' ? 'شراء' : 'Buy'}</span>
            </div>
            <div className="text-lg font-bold text-green-800">
              {gold.buy_price.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg text-center border border-red-200">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp size={16} className={`text-red-600 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
              <span className="text-sm text-red-700 font-medium">{language === 'ar' ? 'بيع' : 'Sell'}</span>
            </div>
            <div className="text-lg font-bold text-red-800">
              {gold.sell_price.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-400 text-center">
          {language === 'ar' ? 'آخر تحديث:' : 'Last update:'} {new Date(gold.updated_at).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}
        </div>
      </CardContent>
    </Card>
  );
};
