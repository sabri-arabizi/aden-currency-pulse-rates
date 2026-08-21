import 'package:aden_currency_flutter/features/gold_prices/domain/gold_freshness.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final now = DateTime(2026, 8, 11, 15, 0);

  group('isGoldStale (عتبة 24 ساعة)', () {
    test('تحديث حديث ليس قديماً', () {
      expect(
        isGoldStale(now.subtract(const Duration(hours: 2)), now: now),
        isFalse,
      );
    });

    test('أقدم من 24 ساعة يعتبر قديماً', () {
      expect(
        isGoldStale(now.subtract(const Duration(hours: 25)), now: now),
        isTrue,
      );
    });

    test('بالضبط 24 ساعة يعتبر قديماً (مطابق لـ <= في الويب)', () {
      expect(
        isGoldStale(now.subtract(const Duration(hours: 24)), now: now),
        isTrue,
      );
    });
  });
}
