import 'package:aden_currency_flutter/core/utils/currency_formatter.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('formatCurrencyPrice (بطاقات عدن)', () {
    test('USD: من 2 إلى 4 خانات عشرية', () {
      expect(formatCurrencyPrice(530.5, 'USD'), '530.50');
      expect(formatCurrencyPrice(530.1234, 'USD'), '530.1234');
      expect(formatCurrencyPrice(530, 'USD'), '530.00');
    });

    test('SAR: من 0 إلى خانتين', () {
      expect(formatCurrencyPrice(140, 'SAR'), '140');
      expect(formatCurrencyPrice(140.25, 'SAR'), '140.25');
    });

    test('EGP: خانتان عشريتان ثابتتان', () {
      expect(formatCurrencyPrice(79, 'EGP'), '79.00');
      expect(formatCurrencyPrice(79.24, 'EGP'), '79.24');
    });

    test('عملات أخرى: من 0 إلى خانتين مع فواصل الآلاف', () {
      expect(formatCurrencyPrice(1500, 'OMR'), '1,500');
      expect(formatCurrencyPrice(148.1, 'AED'), '148.1');
    });
  });

  group('formatSanaaCurrencyPrice (بطاقات صنعاء)', () {
    test('USD: من 2 إلى 4 خانات', () {
      expect(formatSanaaCurrencyPrice(250.5, 'USD'), '250.50');
    });

    test('EGP في صنعاء: بدون قاعدة الخانتين الثابتتين', () {
      expect(formatSanaaCurrencyPrice(79, 'EGP'), '79');
    });
  });

  test('formatGoldPrice: فواصل آلاف', () {
    expect(formatGoldPrice(125000), '125,000');
    expect(formatGoldPrice(98500.5), '98,500.5');
  });
}
