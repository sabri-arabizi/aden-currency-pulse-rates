import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ExchangeRate } from '@/hooks/useExchangeRates';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
interface SanaaCurrencyCardsProps {
  rates: ExchangeRate[];
}
const SanaaCurrencyCards = ({
  rates
}: SanaaCurrencyCardsProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  const getCurrencyIcon = (currencyCode: string) => {
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
  const getCurrencyGradient = (currencyCode: string) => {
    switch (currencyCode) {
      case 'SAR':
        return 'from-emerald-500 via-green-500 to-teal-500';
      case 'AED':
        return 'from-red-500 via-rose-500 to-pink-500';
      case 'USD':
        return 'from-blue-500 via-indigo-500 to-purple-500';
      case 'EUR':
        return 'from-amber-500 via-orange-500 to-yellow-500';
      case 'EGP':
        return 'from-violet-500 via-purple-500 to-fuchsia-500';
      default:
        return 'from-gray-500 via-slate-500 to-zinc-500';
    }
  };
  const getCurrencyBorderColor = (currencyCode: string) => {
    switch (currencyCode) {
      case 'SAR':
        return 'border-emerald-200/50';
      case 'AED':
        return 'border-red-200/50';
      case 'USD':
        return 'border-blue-200/50';
      case 'EUR':
        return 'border-amber-200/50';
      case 'EGP':
        return 'border-violet-200/50';
      default:
        return 'border-gray-200/50';
    }
  };
  if (!rates || rates.length === 0) {
    return <div className="text-center p-8">
        <div className="text-white/60 text-lg">لا توجد بيانات أسعار صرف متاحة</div>
      </div>;
  }
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
      {rates.map(rate => <Card key={`${rate.currency_code}-${rate.city}`} className={`
            relative overflow-hidden
            bg-white/95 backdrop-blur-sm 
            border-2 ${getCurrencyBorderColor(rate.currency_code)}
            shadow-xl hover:shadow-2xl 
            transition-all duration-500 ease-out
            transform hover:scale-105 hover:-translate-y-2
            group cursor-pointer
          `}>
          {/* خلفية متدرجة خفيفة */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getCurrencyGradient(rate.currency_code)} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
          
          {/* مؤشر الحالة المباشرة */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
            <span className="text-green-600 text-xs font-bold tracking-wide">مباشر</span>
          </div>

          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center gap-4 mb-3">
              {/* أيقونة العملة */}
              <div className={`
                w-14 h-14 
                bg-gradient-to-br ${getCurrencyGradient(rate.currency_code)} 
                rounded-2xl flex items-center justify-center 
                shadow-lg group-hover:shadow-xl
                transform group-hover:rotate-6 transition-all duration-300
              `}>
                <span className="text-2xl drop-shadow-sm">{getCurrencyIcon(rate.currency_code)}</span>
              </div>
              
              {/* معلومات العملة */}
              <div className="flex-1 text-right">
                <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-gray-900 transition-colors">
                  {rate.currency_name}
                </h3>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                    {rate.currency_code}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 pb-6">
            {/* أسعار الشراء والبيع */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* سعر الشراء */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl text-center border-2 border-green-100 group-hover:border-green-200 transition-colors relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <TrendingUp size={14} className="text-green-600" />
                </div>
                <div className="text-xs text-green-700 font-bold mb-2 tracking-wide">شراء</div>
                <div className="text-xl font-black text-green-800 font-mono">
                  {formatPrice(rate.buy_price)}
                </div>
              </div>
              
              {/* سعر البيع */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-2xl text-center border-2 border-red-100 group-hover:border-red-200 transition-colors relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <TrendingDown size={14} className="text-red-600" />
                </div>
                <div className="text-xs text-red-700 font-bold mb-2 tracking-wide">بيع</div>
                <div className="text-xl font-black text-red-141 font-mono">
                  {formatPrice(rate.sell_price)}
                </div>
              </div>
            </div>
            
            {/* معلومات التحديث */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mb-2">
                <Clock size={12} className="text-gray-500" />
                <span className="font-medium">آخر تحديث</span>
              </div>
              <div className="text-center text-xs font-bold text-gray-700">
                {new Date(rate.updated_at).toLocaleString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              hour12: true
            })}
              </div>
            </div>
            
            {/* مصدر البيانات */}
            <div className="text-center mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 font-medium">
                المصدر: <span className="text-blue-600 font-bold">khbr.me</span>
              </div>
            </div>
          </CardContent>

          {/* تأثير الإضاءة عند التمرير */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out" />
        </Card>)}
    </div>;
};
export default SanaaCurrencyCards;