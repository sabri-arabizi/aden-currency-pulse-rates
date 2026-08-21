import '../../../../core/constants/app_constants.dart';

/// كيان سعر صرف العملة (طبقة Domain) — مطابق لجدول exchange_rates.
class ExchangeRate {
  const ExchangeRate({
    required this.id,
    required this.currencyCode,
    required this.currencyName,
    required this.buyPrice,
    required this.sellPrice,
    required this.flagUrl,
    required this.city,
    required this.updatedAt,
  });

  /// المعرّف في قاعدة البيانات.
  final String id;

  /// رمز العملة (SAR/USD/AED/EGP...).
  final String currencyCode;

  /// اسم العملة المعروض (يأتي من قاعدة البيانات).
  final String currencyName;

  /// سعر الشراء بالريال اليمني.
  final double buyPrice;

  /// سعر البيع بالريال اليمني.
  final double sellPrice;

  /// رابط صورة العلم.
  final String flagUrl;

  /// المدينة ('عدن' / 'صنعاء').
  final String city;

  /// وقت آخر تحديث.
  final DateTime updatedAt;

  /// هل العملة محدّثة تلقائياً؟ (SAR/USD/AED/EGP كما في تطبيق الويب).
  bool get isAutoUpdated =>
      AppConstants.currencyPriority.containsKey(currencyCode);
}
