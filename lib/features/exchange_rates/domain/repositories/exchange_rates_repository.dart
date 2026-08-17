import '../entities/exchange_rate.dart';

/// عقد مستودع أسعار الصرف (طبقة Domain).
abstract class ExchangeRatesRepository {
  /// جلب أسعار الصرف لمدينة معيّنة، مرتبة حسب أولوية العملات
  /// (SAR ← USD ← AED ← EGP ثم الباقي أبجدياً).
  Future<List<ExchangeRate>> getRates(String city);
}
