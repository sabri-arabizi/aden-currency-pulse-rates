import 'package:intl/intl.dart';

// قواعد تنسيق أرقام العملات، مطابقة حرفياً لتطبيق الويب
// (CurrencyCard.tsx / SanaaCurrencyCards.tsx).
//
// - USD: من 2 إلى 4 خانات عشرية.
// - SAR: من 0 إلى 2 خانتين.
// - EGP: خانتان عشريتان بالضبط (في بطاقة عدن فقط).
// - غيرها: من 0 إلى 2 خانتين.

String _format(double price, int minDigits, int maxDigits) {
  final format = NumberFormat('#,##0.0#', 'en-US')
    ..minimumFractionDigits = minDigits
    ..maximumFractionDigits = maxDigits;
  return format.format(price);
}

/// تنسيق السعر في بطاقات عدن (CurrencyCard.tsx):
/// USD بـ 2-4 خانات، EGP بخانتين ثابتتين، SAR وغيرها بـ 0-2.
String formatCurrencyPrice(double price, String currencyCode) {
  switch (currencyCode) {
    case 'USD':
      return _format(price, 2, 4);
    case 'EGP':
      return _format(price, 2, 2);
    case 'SAR':
    default:
      return _format(price, 0, 2);
  }
}

/// تنسيق السعر في بطاقات صنعاء (SanaaCurrencyCards.tsx):
/// USD بـ 2-4 خانات، الباقي بـ 0-2 (بدون قاعدة خاصة لـ EGP).
String formatSanaaCurrencyPrice(double price, String currencyCode) {
  if (currencyCode == 'USD') {
    return _format(price, 2, 4);
  }
  return _format(price, 0, 2);
}

/// تنسيق سعر الذهب بالفواصل (مثل toLocaleString في الويب).
String formatGoldPrice(double price) =>
    NumberFormat('#,##0.##', 'en-US').format(price);
