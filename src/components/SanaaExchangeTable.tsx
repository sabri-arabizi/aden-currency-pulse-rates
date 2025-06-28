
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExchangeRate } from '@/hooks/useExchangeRates';
import { Clock, Globe } from 'lucide-react';

interface SanaaExchangeTableProps {
  rates: ExchangeRate[];
}

const SanaaExchangeTable = ({ rates }: SanaaExchangeTableProps) => {
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

  const getLastUpdateTime = (updatedAt: string) => {
    const updateTime = new Date(updatedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'الآن';
    } else if (diffMinutes < 60) {
      return `منذ ${diffMinutes} دقيقة`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      return `منذ ${diffHours} ساعة`;
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="pb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
        <CardTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
          <Globe size={24} />
          أسعار الصرف - مدينة صنعاء
        </CardTitle>
        <p className="text-center text-sm opacity-90">
          المصدر: khbr.me/rate.html
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="text-right font-bold text-gray-800">العملة</TableHead>
              <TableHead className="text-center font-bold text-green-700">سعر الشراء</TableHead>
              <TableHead className="text-center font-bold text-red-700">سعر البيع</TableHead>
              <TableHead className="text-center font-bold text-gray-600">آخر تحديث</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map((rate) => (
              <TableRow key={`${rate.currency_code}-${rate.city}`} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="text-right">
                  <div className="flex items-center gap-3">
                    <img 
                      src={rate.flag_url} 
                      alt={rate.currency_name} 
                      className="w-8 h-6 rounded shadow-md border border-gray-200"
                    />
                    <div>
                      <div className="font-bold text-gray-800">{rate.currency_name}</div>
                      <div className="text-sm text-gray-600">{rate.currency_code}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    <div className="text-lg font-bold text-green-800">
                      {formatPrice(rate.buy_price, rate.currency_code)}
                    </div>
                    <div className="text-xs text-green-600">ريال يمني</div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    <div className="text-lg font-bold text-red-800">
                      {formatPrice(rate.sell_price, rate.currency_code)}
                    </div>
                    <div className="text-xs text-red-600">ريال يمني</div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    {getLastUpdateTime(rate.updated_at)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(rate.updated_at).toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      hour12: true
                    })}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="p-4 bg-gray-50/50 text-center border-t">
          <div className="text-sm text-gray-600">
            📊 جدول أسعار الصرف المحدث من موقع khbr.me
          </div>
          <div className="text-xs text-gray-500 mt-1">
            يتم التحديث تلقائياً كل ساعة
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SanaaExchangeTable;
