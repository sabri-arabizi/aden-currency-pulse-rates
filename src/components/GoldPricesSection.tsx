
import React from 'react';
import { useGoldPrices } from '@/hooks/useGoldPrices';
import { GoldCard } from './GoldCard';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface GoldPricesSectionProps {
  city: string;
  language: 'ar' | 'en';
}

export const GoldPricesSection = ({ city, language }: GoldPricesSectionProps) => {
  const { data: goldPrices, isLoading, error, refetch } = useGoldPrices(city);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        <span className="mr-2 text-gray-600">
          {language === 'ar' ? 'جاري جلب أسعار الذهب...' : 'Loading gold prices...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{language === 'ar' ? 'خطأ' : 'Error'}</AlertTitle>
        <AlertDescription>
          {language === 'ar' 
            ? 'حدث خطأ في جلب أسعار الذهب. يرجى المحاولة مرة أخرى.'
            : 'Failed to fetch gold prices. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  // حالة عدم وجود بيانات حديثة
  if (!goldPrices || goldPrices.length === 0) {
    return (
      <Alert className="my-4 border-orange-300 bg-orange-50">
        <RefreshCw className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">
          {language === 'ar' ? 'لا توجد بيانات حديثة' : 'No Fresh Data Available'}
        </AlertTitle>
        <AlertDescription className="text-orange-700">
          {language === 'ar' 
            ? 'لا توجد أسعار ذهب حديثة لمدينة ' + (city === 'عدن' ? 'عدن' : 'صنعاء') + '. اضغط على زر "تحديث يدوي" للحصول على أحدث الأسعار.'
            : `No recent gold prices available for ${city === 'عدن' ? 'Aden' : 'Sanaa'}. Press "Manual Refresh" to get the latest prices.`}
        </AlertDescription>
      </Alert>
    );
  }

  // التحقق من وجود بيانات قديمة
  const hasStaleData = goldPrices.some((gold: any) => gold._isStale);

  return (
    <div className="space-y-4">
      {/* تحذير البيانات القديمة */}
      {hasStaleData && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">
            {language === 'ar' ? 'تنبيه: بيانات قديمة' : 'Warning: Stale Data'}
          </AlertTitle>
          <AlertDescription className="text-orange-700">
            {language === 'ar' 
              ? 'الأسعار المعروضة قد تكون قديمة. اضغط على "تحديث يدوي" للحصول على أحدث الأسعار.'
              : 'Displayed prices may be outdated. Press "Manual Refresh" to get the latest prices.'}
          </AlertDescription>
        </Alert>
      )}

      {/* شبكة بطاقات الذهب */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {goldPrices.map((gold) => (
          <GoldCard key={gold.id} gold={gold} language={language} />
        ))}
      </div>
    </div>
  );
};
