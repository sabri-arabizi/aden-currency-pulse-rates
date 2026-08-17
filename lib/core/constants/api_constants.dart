/// ثوابت الاتصال بخادم Supabase (عنوان المشروع، المفتاح، الجداول، الدوال).
library;

class ApiConstants {
  ApiConstants._();

  /// عنوان مشروع Supabase (من تطبيق React الأصلي).
  static const String supabaseUrl =
      'https://lgkexjmtzmcwfbkockwj.supabase.co';

  /// مفتاح anon العام (من تطبيق React الأصلي).
  static const String supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0';

  /// مسار PostgREST لقراءة الجداول.
  static const String restBaseUrl = '$supabaseUrl/rest/v1';

  /// مسار Edge Functions.
  static const String functionsBaseUrl = '$supabaseUrl/functions/v1';

  // أسماء الجداول
  static const String exchangeRatesTable = 'exchange_rates';
  static const String goldPricesTable = 'gold_prices';

  // أسماء دوال التحديث اليدوي (Edge Functions)
  static const String fnUpdateSar = 'update-sar-prices';
  static const String fnUpdateAed = 'update-aed-prices';
  static const String fnUpdateEgp = 'update-egp-from-2dec';
  static const String fnUpdateSanaa = 'update-sanaa-rates-from-khbr';
  static const String fnUpdateGoldAden = 'update-gold-aden-boqash';
  static const String fnUpdateGoldSanaa = 'update-gold-sanaa-zoza';
}
