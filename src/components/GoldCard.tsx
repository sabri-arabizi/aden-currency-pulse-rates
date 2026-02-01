
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoldPrice } from '@/hooks/useGoldPrices';
import { TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react';

interface GoldCardProps {
  gold: GoldPrice & { _isStale?: boolean };
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
  const isStale = gold._isStale;

  // حساب الفارق الزمني
  const getTimeDiff = () => {
    const updateTime = new Date(gold.updated_at).getTime();
    const now = Date.now();
    const diffMinutes = Math.floor((now - updateTime) / (1000 * 60));
    
    if (diffMinutes < 1) return language === 'ar' ? 'الآن' : 'Just now';
    if (diffMinutes < 60) return language === 'ar' ? `منذ ${diffMinutes} دقيقة` : `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return language === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return language === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  };

  return (
    <Card className={`h-full bg-white border-l-4 ${
      isStale 
        ? 'border-l-gray-400 opacity-70' 
        : isGoldPound 
          ? 'border-l-amber-600' 
          : 'border-l-yellow-500'
    } hover:shadow-lg transition-shadow duration-300 relative`}>
      {/* شارة البيانات القديمة */}
      {isStale && (
        <div className="absolute top-2 right-2 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <AlertTriangle size={12} />
          {language === 'ar' ? 'قديم' : 'Stale'}
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`w-10 h-8 ${
            isStale
              ? 'bg-gradient-to-r from-gray-400 to-gray-500'
              : isGoldPound 
                ? 'bg-gradient-to-r from-amber-500 to-amber-700' 
                : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
          } rounded-sm shadow-sm flex items-center justify-center`}>
            <span className="text-white text-sm font-bold">{getKaratDisplay(gold.type)}</span>
          </div>
        </div>
        <CardTitle className={`text-lg font-bold ${isStale ? 'text-gray-500' : 'text-gray-800'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          {getTypeDisplay(gold.type)}
        </CardTitle>
        <p className={`text-sm text-gray-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          {language === 'ar' ? 'سعر الجرام بالريال اليمني' : 'Price per gram in YER'}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className={`${isStale ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'} p-3 rounded-lg text-center border`}>
            <div className="flex items-center justify-center mb-1">
              <TrendingDown size={16} className={`${isStale ? 'text-gray-500' : 'text-green-600'} ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
              <span className={`text-sm font-medium ${isStale ? 'text-gray-600' : 'text-green-700'}`}>
                {language === 'ar' ? 'شراء' : 'Buy'}
              </span>
            </div>
            <div className={`text-lg font-bold ${isStale ? 'text-gray-600' : 'text-green-800'}`}>
              {gold.buy_price.toLocaleString()}
            </div>
          </div>
          
          <div className={`${isStale ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'} p-3 rounded-lg text-center border`}>
            <div className="flex items-center justify-center mb-1">
              <TrendingUp size={16} className={`${isStale ? 'text-gray-500' : 'text-red-600'} ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
              <span className={`text-sm font-medium ${isStale ? 'text-gray-600' : 'text-red-700'}`}>
                {language === 'ar' ? 'بيع' : 'Sell'}
              </span>
            </div>
            <div className={`text-lg font-bold ${isStale ? 'text-gray-600' : 'text-red-800'}`}>
              {gold.sell_price.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* عرض وقت التحديث بشكل واضح */}
        <div className={`mt-3 text-xs text-center flex items-center justify-center gap-1 ${isStale ? 'text-orange-600' : 'text-gray-400'}`}>
          <Clock size={12} />
          {isStale && (language === 'ar' ? '⚠️ ' : '⚠️ ')}
          {getTimeDiff()} - {new Date(gold.updated_at).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </CardContent>
    </Card>
  );
};
