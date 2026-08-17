/// كيان سعر الذهب (طبقة Domain) — مطابق لجدول gold_prices.
library;

class GoldPrice {
  const GoldPrice({
    required this.id,
    required this.type,
    required this.buyPrice,
    required this.sellPrice,
    required this.city,
    required this.updatedAt,
    required this.isStale,
  });

  /// المعرّف في قاعدة البيانات.
  final String id;

  /// النوع ('عيار 18' / 'عيار 21' / 'عيار 22' / 'جنيه ذهب').
  final String type;

  /// سعر الشراء بالريال اليمني.
  final double buyPrice;

  /// سعر البيع بالريال اليمني.
  final double sellPrice;

  /// المدينة ('عدن' / 'صنعاء').
  final String city;

  /// وقت آخر تحديث.
  final DateTime updatedAt;

  /// هل البيانات قديمة؟ (أقدم من 24 ساعة — مطابق لـ _isStale في الويب).
  final bool isStale;

  /// هل النوع "جنيه ذهب"؟
  bool get isGoldPound => type == 'جنيه ذهب';
}
