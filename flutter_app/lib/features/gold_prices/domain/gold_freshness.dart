/// منطق حداثة بيانات الذهب (منقول من useGoldPrices.ts).
library;

/// التحقق من أن البيانات قديمة: آخر تحديث أقدم من 24 ساعة.
///
/// مطابق لحساب `_isStale` في useGoldPrices:
/// `updateTime <= now - 24h`.
bool isGoldStale(DateTime updatedAt, {DateTime? now}) {
  final current = now ?? DateTime.now();
  final twentyFourHoursAgo =
      current.subtract(const Duration(hours: 24));
  return !updatedAt.isAfter(twentyFourHoursAgo);
}
