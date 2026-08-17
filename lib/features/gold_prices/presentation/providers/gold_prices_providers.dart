import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repositories/gold_prices_repository_impl.dart';
import '../../domain/entities/gold_price.dart';

/// مزوّد أسعار الذهب لكل مدينة (family).
///
/// بدون إعادة جلب دورية (مطابق لـ refetchInterval: false في الويب) —
/// يُعاد الجلب عند فتح التبويب أو عند التحديث اليدوي (invalidate).
final goldPricesProvider = AsyncNotifierProvider
    .family<GoldPricesNotifier, List<GoldPrice>, String>(
        GoldPricesNotifier.new);

/// Notifier أسعار الذهب لمدينة واحدة.
class GoldPricesNotifier
    extends FamilyAsyncNotifier<List<GoldPrice>, String> {
  @override
  Future<List<GoldPrice>> build(String arg) {
    return ref.watch(goldPricesRepositoryProvider).getGoldPrices(arg);
  }
}
