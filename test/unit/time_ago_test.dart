import 'package:aden_currency_flutter/core/l10n/language_controller.dart';
import 'package:aden_currency_flutter/core/utils/time_ago.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final now = DateTime(2026, 8, 11, 15, 0);

  group('adenTimeAgo (عربي دائماً)', () {
    test('الآن / دقائق / ساعات', () {
      expect(adenTimeAgo(now.subtract(const Duration(seconds: 30)), now: now), 'الآن');
      expect(adenTimeAgo(now.subtract(const Duration(minutes: 5)), now: now), 'منذ 5 دقيقة');
      expect(adenTimeAgo(now.subtract(const Duration(hours: 3)), now: now), 'منذ 3 ساعة');
    });
  });

  group('sanaaTimeAgo (إنجليزي دائماً)', () {
    test('Now / m ago / h ago', () {
      expect(sanaaTimeAgo(now.subtract(const Duration(seconds: 10)), now: now), 'Now');
      expect(sanaaTimeAgo(now.subtract(const Duration(minutes: 45)), now: now), '45m ago');
      expect(sanaaTimeAgo(now.subtract(const Duration(hours: 7)), now: now), '7h ago');
    });
  });

  group('goldTimeAgo (ثنائي اللغة مع الأيام)', () {
    test('عربي', () {
      expect(goldTimeAgo(now.subtract(const Duration(minutes: 1)), Language.ar, now: now), 'منذ 1 دقيقة');
      expect(goldTimeAgo(now.subtract(const Duration(hours: 5)), Language.ar, now: now), 'منذ 5 ساعة');
      expect(goldTimeAgo(now.subtract(const Duration(days: 2)), Language.ar, now: now), 'منذ 2 يوم');
    });

    test('إنجليزي', () {
      expect(goldTimeAgo(now.subtract(const Duration(seconds: 5)), Language.en, now: now), 'Just now');
      expect(goldTimeAgo(now.subtract(const Duration(minutes: 30)), Language.en, now: now), '30m ago');
      expect(goldTimeAgo(now.subtract(const Duration(days: 3)), Language.en, now: now), '3d ago');
    });
  });
}
