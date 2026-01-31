
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoldPrice } from '@/hooks/useGoldPrices';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface GoldCardProps {
  gold: GoldPrice;
  language: 'ar' | 'en';
}

export const GoldCard = ({ gold, language }: GoldCardProps) => {
  // Format the type display
  const getTypeDisplay = (type: string) => {
    if (type === 'جنيه ذهب') {
      return language === 'ar' ? 'جنيه ذهب' : 'Gold Pound';
    }
    if (language === 'ar') {
      return type;
    }
    // For English, convert عيار XX to XX Karat
    const karatMatch = type.match(/عيار\s*(\d+)/);
    if (karatMatch) {
      return `${karatMatch[1]} Karat`;
    }
    return type;
  };

  // Get the karat number or icon for display
  const getKaratDisplay = (type: string) => {
    if (type === 'جنيه ذهب') {
      return '£';
    }
    const karatMatch = type.match(/عيار\s*(\d+)/);
    if (karatMatch) {
      return karatMatch[1];
    }
    return 'Au';
  };

  const isGoldPound = gold.type === 'جنيه ذهب';

  return (
    <Card className={`h-full bg-white border-l-4 ${isGoldPound ? 'border-l-amber-600' : 'border-l-yellow-500'} hover:shadow-lg transition-shadow duration-300`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`w-10 h-8 ${isGoldPound ? 'bg-gradient-to-r from-amber-500 to-amber-700' : 'bg-gradient-to-r from-yellow-400 to-yellow-600'} rounded-sm shadow-sm flex items-center justify-center`}>
            <span className="text-white text-sm font-bold">{getKaratDisplay(gold.type)}</span>
          </div>
        </div>
        <CardTitle className={`text-lg font-bold text-gray-800 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          {getTypeDisplay(gold.type)}
        </CardTitle>
        <p className={`text-sm text-gray-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          {language === 'ar' ? 'سعر الجرام بالريال اليمني' : 'Price per gram in YER'}
        </p>
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
