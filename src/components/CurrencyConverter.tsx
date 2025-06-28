
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Calculator } from 'lucide-react';
import { ExchangeRate } from '@/hooks/useExchangeRates';

interface CurrencyConverterProps {
  rates: ExchangeRate[];
  language: 'ar' | 'en';
}

const CurrencyConverter = ({ rates, language }: CurrencyConverterProps) => {
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('YER');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [result, setResult] = useState<string>('');
  const [conversionType, setConversionType] = useState<'buy' | 'sell'>('buy');

  const availableCurrencies = [
    { 
      code: 'YER', 
      name: language === 'ar' ? 'ريال يمني' : 'Yemeni Rial', 
      flag: '🇾🇪' 
    },
    ...rates.map(rate => ({
      code: rate.currency_code,
      name: rate.currency_name,
      flag: '🌍'
    }))
  ];

  const convertCurrency = () => {
    if (!amount || isNaN(Number(amount))) {
      setResult(language === 'ar' ? 'يرجى إدخال رقم صحيح' : 'Please enter a valid number');
      return;
    }

    const inputAmount = parseFloat(amount);
    
    if (fromCurrency === 'YER' && toCurrency !== 'YER') {
      // Convert from YER to foreign currency
      const targetRate = rates.find(rate => rate.currency_code === toCurrency);
      if (targetRate) {
        const rate = conversionType === 'buy' ? targetRate.buy_price : targetRate.sell_price;
        const convertedAmount = inputAmount / rate;
        setResult(`${convertedAmount.toFixed(4)} ${toCurrency}`);
      }
    } else if (fromCurrency !== 'YER' && toCurrency === 'YER') {
      // Convert from foreign currency to YER
      const sourceRate = rates.find(rate => rate.currency_code === fromCurrency);
      if (sourceRate) {
        const rate = conversionType === 'buy' ? sourceRate.buy_price : sourceRate.sell_price;
        const convertedAmount = inputAmount * rate;
        setResult(`${convertedAmount.toFixed(2)} YER`);
      }
    } else if (fromCurrency !== 'YER' && toCurrency !== 'YER') {
      // Convert between two foreign currencies via YER
      const sourceRate = rates.find(rate => rate.currency_code === fromCurrency);
      const targetRate = rates.find(rate => rate.currency_code === toCurrency);
      
      if (sourceRate && targetRate) {
        const sourceToYer = inputAmount * (conversionType === 'buy' ? sourceRate.buy_price : sourceRate.sell_price);
        const yerToTarget = sourceToYer / (conversionType === 'buy' ? targetRate.buy_price : targetRate.sell_price);
        setResult(`${yerToTarget.toFixed(4)} ${toCurrency}`);
      }
    } else {
      setResult(`${inputAmount.toFixed(2)} ${toCurrency}`);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <Calculator size={28} className="text-blue-600" />
            {language === 'ar' ? 'محول العملات' : 'Currency Converter'}
          </CardTitle>
          <p className="text-gray-600">
            {language === 'ar' ? 'تحويل بين الريال اليمني والعملات الأخرى' : 'Convert between Yemeni Rial and other currencies'}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Conversion Type Selection */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setConversionType('buy')}
              variant={conversionType === 'buy' ? 'default' : 'outline'}
              className="px-6"
            >
              {language === 'ar' ? 'سعر الشراء' : 'Buy Rate'}
            </Button>
            <Button
              onClick={() => setConversionType('sell')}
              variant={conversionType === 'sell' ? 'default' : 'outline'}
              className="px-6"
            >
              {language === 'ar' ? 'سعر البيع' : 'Sell Rate'}
            </Button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {language === 'ar' ? 'المبلغ' : 'Amount'}
            </label>
            <Input
              type="number"
              placeholder={language === 'ar' ? 'أدخل المبلغ' : 'Enter amount'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg p-3"
            />
          </div>

          {/* From Currency */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {language === 'ar' ? 'من' : 'From'}
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableCurrencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              onClick={swapCurrencies}
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12"
            >
              <ArrowUpDown size={20} />
            </Button>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {language === 'ar' ? 'إلى' : 'To'}
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableCurrencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Convert Button */}
          <Button
            onClick={convertCurrency}
            className="w-full text-lg py-3"
            disabled={!amount}
          >
            {language === 'ar' ? 'تحويل' : 'Convert'}
          </Button>

          {/* Result */}
          {result && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 text-center">
              <div className="text-sm text-gray-600 mb-2">
                {language === 'ar' ? 'نتيجة التحويل' : 'Conversion Result'}
              </div>
              <div className="text-2xl font-bold text-blue-800">{result}</div>
              <div className="text-xs text-gray-500 mt-2">
                {language === 'ar' ? `باستخدام سعر ${conversionType === 'buy' ? 'الشراء' : 'البيع'} • يتم تحديث الأسعار بانتظام` : `Using ${conversionType} rate • Rates updated regularly`}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>{language === 'ar' ? 'إخلاء مسؤولية:' : 'Disclaimer:'}</strong>{' '}
              {language === 'ar' 
                ? 'هذه الأسعار للأغراض الإعلامية فقط. قد تختلف أسعار الصرف الفعلية. يرجى تأكيد الأسعار الحالية قبل إجراء المعاملات.'
                : 'These rates are for informational purposes only. Actual exchange rates may vary. Please confirm current rates before making transactions.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencyConverter;
