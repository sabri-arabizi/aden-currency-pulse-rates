import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/ads/ads_service.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/storage/local_storage.dart';
import '../../../exchange_rates/presentation/providers/exchange_rates_providers.dart';
import '../../../gold_prices/presentation/providers/gold_prices_providers.dart';
import '../../data/refresh_remote_ds.dart';

/// ملخص نتيجة التحديث اليدوي (لعرضها في SnackBar).
class RefreshSummary {
  const RefreshSummary({required this.results, this.unexpectedError});

  /// نتائج كل دالة تحديث.
  final List<UpdateResult> results;

  /// خطأ عام غير متوقع (خارج نتائج الدوال).
  final String? unexpectedError;

  /// عدد العمليات الناجحة.
  int get successCount => results.where((r) => r.success).length;

  /// عدد العمليات الفاشلة.
  int get failCount => results.where((r) => !r.success).length;
}

/// حالة زر التحديث اليدوي: هل التحديث جارٍ الآن؟
final manualRefreshProvider =
    NotifierProvider<ManualRefreshController, bool>(
        ManualRefreshController.new);

/// متحكم التحديث اليدوي — منقول من ManualRefreshButton.tsx:
///
/// 1. عرض إعلان بمكافأة (لا يمنع التحديث عند فشله).
/// 2. استدعاء دوال تحديث العملات الأربع بالتوازي.
/// 3. استدعاء تحديث ذهب عدن ثم ذهب صنعاء (تسلسلياً) مع حفظ وقت النجاح.
/// 4. إبطال كاش الأسعار والذهب لإعادة الجلب الفوري.
class ManualRefreshController extends Notifier<bool> {
  @override
  bool build() => false;

  /// تنفيذ التحديث اليدوي الكامل وإرجاع ملخص النتائج.
  Future<RefreshSummary> refresh() async {
    if (state) {
      return const RefreshSummary(results: []);
    }

    // إظهار إعلان بمكافأة — لا ننتظره ولا نسمح له بإيقاف التحديث.
    unawaited(ref.read(adsServiceProvider).showRewarded());

    state = true;
    final ds = ref.read(refreshRemoteDsProvider);
    final storage = ref.read(localStorageProvider);
    final results = <UpdateResult>[];

    try {
      // الخطوة 1: تحديث أسعار الصرف (الدوال الأربع بالتوازي).
      final exchangeResults = await Future.wait([
        ds.invokeCurrencyFunction(ApiConstants.fnUpdateSar, 'SAR'),
        ds.invokeCurrencyFunction(ApiConstants.fnUpdateAed, 'AED'),
        ds.invokeCurrencyFunction(ApiConstants.fnUpdateEgp, 'EGP'),
        ds.invokeCurrencyFunction(ApiConstants.fnUpdateSanaa, 'صنعاء'),
      ]);
      results.addAll(exchangeResults);

      // الخطوة 2: تحديث أسعار الذهب (تسلسلياً، مع تسجيل وقت النجاح).
      final adenGold = await ds.invokeGoldFunction(
          ApiConstants.fnUpdateGoldAden, 'ذهب عدن');
      if (adenGold.success) {
        await storage.setGoldLastUpdate(
            AppConstants.cityAden, DateTime.now().millisecondsSinceEpoch);
      }
      results.add(adenGold);

      final sanaaGold = await ds.invokeGoldFunction(
          ApiConstants.fnUpdateGoldSanaa, 'ذهب صنعاء');
      if (sanaaGold.success) {
        await storage.setGoldLastUpdate(
            AppConstants.citySanaa, DateTime.now().millisecondsSinceEpoch);
      }
      results.add(sanaaGold);

      // الخطوة 3: إبطال الكاش لإعادة جلب البيانات فوراً.
      ref.invalidate(exchangeRatesProvider);
      ref.invalidate(goldPricesProvider);

      return RefreshSummary(results: results);
    } on Exception catch (e) {
      return RefreshSummary(results: results, unexpectedError: e.toString());
    } finally {
      state = false;
    }
  }
}
