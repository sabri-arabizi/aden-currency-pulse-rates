import 'package:aden_currency_flutter/features/converter/domain/currency_converter_logic.dart';
import 'package:aden_currency_flutter/features/exchange_rates/domain/entities/exchange_rate.dart';
import 'package:flutter_test/flutter_test.dart';

ExchangeRate rate(String code, double buy, double sell) => ExchangeRate(
      id: code,
      currencyCode: code,
      currencyName: code,
      buyPrice: buy,
      sellPrice: sell,
      flagUrl: '',
      city: 'عدن',
      updatedAt: DateTime(2026),
    );

void main() {
  final rates = [
    rate('USD', 530, 535),
    rate('SAR', 140, 141),
  ];

  group('convertCurrency', () {
    test('مدخل غير صالح', () {
      final result = convertCurrency(
        amountText: 'abc',
        fromCurrency: 'YER',
        toCurrency: 'USD',
        useBuyRate: true,
        rates: rates,
      );
      expect(result.isError, isTrue);
    });

    test('YER إلى أجنبية: قسمة على السعر (4 خانات)', () {
      final result = convertCurrency(
        amountText: '1060',
        fromCurrency: 'YER',
        toCurrency: 'USD',
        useBuyRate: true,
        rates: rates,
      );
      expect(result.text, '2.0000 USD');
    });

    test('أجنبية إلى YER: ضرب في السعر (خانتان)', () {
      final result = convertCurrency(
        amountText: '2',
        fromCurrency: 'USD',
        toCurrency: 'YER',
        useBuyRate: false, // سعر البيع 535
        rates: rates,
      );
      expect(result.text, '1070.00 YER');
    });

    test('بين عملتين أجنبيتين عبر YER', () {
      final result = convertCurrency(
        amountText: '1',
        fromCurrency: 'USD',
        toCurrency: 'SAR',
        useBuyRate: true,
        rates: rates,
      );
      // 1 USD → 530 YER → 530 / 140 = 3.7857 SAR
      expect(result.text, '3.7857 SAR');
    });

    test('نفس العملة تُرجع المبلغ كما هو', () {
      final result = convertCurrency(
        amountText: '100',
        fromCurrency: 'YER',
        toCurrency: 'YER',
        useBuyRate: true,
        rates: rates,
      );
      expect(result.text, '100.00 YER');
    });

    test('عملة غير موجودة في الأسعار', () {
      final result = convertCurrency(
        amountText: '100',
        fromCurrency: 'YER',
        toCurrency: 'OMR',
        useBuyRate: true,
        rates: rates,
      );
      expect(result.isError, isTrue);
    });
  });
}
