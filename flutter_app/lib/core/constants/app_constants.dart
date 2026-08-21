/// ثوابت عامة للتطبيق: المدن، مفاتيح التخزين، ترتيب العملات، أنواع الذهب.
library;

class AppConstants {
  AppConstants._();

  // المدن (تُخزَّن في قاعدة البيانات بالعربية)
  static const String cityAden = 'عدن';
  static const String citySanaa = 'صنعاء';

  // مفاتيح التخزين المحلي
  static const String languageKey = 'app-language';
  static const String goldLastUpdateKeyPrefix = 'gold_prices_last_update';

  // معرّفات Unity Ads (من تطبيق Capacitor الأصلي: MainActivity.java)
  static const String unityGameId = '5967793';
  static const String unityBannerPlacement = 'Banner_Android';
  static const String unityInterstitialPlacement = 'Interstitial_Android';
  static const String unityRewardedPlacement = 'Rewarded_Android';

  /// وضع الاختبار في Unity Ads (مطابق للتطبيق الأصلي: testMode = true).
  static const bool unityTestMode = false;

  /// أولوية ترتيب العملات: SAR ثم USD ثم AED ثم EGP ثم الباقي أبجدياً.
  static const Map<String, int> currencyPriority = {
    'SAR': 1,
    'USD': 2,
    'AED': 3,
    'EGP': 4,
  };

  /// أنواع الذهب المعتمدة للعرض.
  static const List<String> validGoldTypes = [
    'عيار 18',
    'عيار 21',
    'عيار 22',
    'جنيه ذهب',
  ];

  /// حد حداثة بيانات الذهب بالدقائق (30 دقيقة).
  static const int goldFreshnessThresholdMinutes = 30;

  /// فترة إعادة جلب أسعار الصرف تلقائياً.
  static const Duration ratesRefetchInterval = Duration(minutes: 2);
}
