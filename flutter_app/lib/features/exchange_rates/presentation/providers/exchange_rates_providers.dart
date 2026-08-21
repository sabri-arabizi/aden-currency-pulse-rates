import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_constants.dart';
import '../../data/repositories/exchange_rates_repository_impl.dart';
import '../../domain/entities/exchange_rate.dart';

/// مزوّد أسعار الصرف لكل مدينة (family).
///
/// يعيد الجلب تلقائياً كل دقيقتين (مطابق لـ refetchInterval في React Query)
/// مع الاحتفاظ بالبيانات السابقة أثناء إعادة الجلب.
final exchangeRatesProvider = AsyncNotifierProvider
    .family<ExchangeRatesNotifier, List<ExchangeRate>, String>(
        ExchangeRatesNotifier.new);

/// Notifier أسعار الصرف لمدينة واحدة.
class ExchangeRatesNotifier
    extends FamilyAsyncNotifier<List<ExchangeRate>, String> {
  Timer? _refetchTimer;

  @override
  Future<List<ExchangeRate>> build(String arg) async {
    // إعادة جلب دورية كل دقيقتين (تعادل refetchInterval: 2 * 60 * 1000).
    _refetchTimer?.cancel();
    _refetchTimer = Timer.periodic(AppConstants.ratesRefetchInterval, (_) {
      ref.invalidateSelf();
    });
    ref.onDispose(() => _refetchTimer?.cancel());

    return ref.watch(exchangeRatesRepositoryProvider).getRates(arg);
  }
}
