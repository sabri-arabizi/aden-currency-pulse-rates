import '../entities/gold_price.dart';

/// عقد مستودع أسعار الذهب (طبقة Domain).
abstract class GoldPricesRepository {
  /// جلب أسعار الذهب لمدينة معيّنة (الأنواع الأربعة المعتمدة فقط،
  /// مع حساب علامة "قديم" لكل سجل).
  Future<List<GoldPrice>> getGoldPrices(String city);
}
