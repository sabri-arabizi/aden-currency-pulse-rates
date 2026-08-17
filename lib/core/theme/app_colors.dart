import 'package:flutter/material.dart';

/// ألوان هوية التطبيق (كهرماني/بني/ذهبي) مطابقة لواجهة الويب.
class AppColors {
  AppColors._();

  /// الذهبي الرئيسي للترويسة.
  static const Color gold = Color(0xFFeac30d);

  /// الذهبي الفاتح لخلفية اختيار المدينة.
  static const Color goldLight = Color(0xFFffd100);

  /// البني المتوسط (حاوية التبويبات).
  static const Color brown = Color(0xFF733f27);

  /// البني الزيتوني الداكن (قسم المدينة).
  static const Color olive = Color(0xFF4d4d25);

  /// بداية تدرّج الخلفية (amber-900).
  static const Color backgroundStart = Color(0xFF78350F);

  /// وسط تدرّج الخلفية (yellow-900).
  static const Color backgroundMiddle = Color(0xFF713F12);

  /// نهاية تدرّج الخلفية (amber-800).
  static const Color backgroundEnd = Color(0xFF92400E);

  /// أصفر فاتح للروابط/الأيقونات (yellow-400).
  static const Color accentYellow = Color(0xFFFACC15);

  /// أخضر الشراء.
  static const Color buyGreen = Color(0xFF166534);

  /// أحمر البيع.
  static const Color sellRed = Color(0xFF991B1B);

  /// تدرّج خلفية الشاشة الرئيسي.
  static const LinearGradient backgroundGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [backgroundStart, backgroundMiddle, backgroundEnd],
  );

  /// تدرّج شعار التطبيق (yellow-400 → orange-500).
  static const LinearGradient logoGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFACC15), Color(0xFFF97316)],
  );

  /// تدرّجات البطاقات حسب العملة (من CurrencyCard.tsx).
  static const Map<String, List<Color>> currencyGradients = {
    'SAR': [Color(0xFF4ADE80), Color(0xFF059669)], // green-400 → emerald-600
    'USD': [Color(0xFF60A5FA), Color(0xFF2563EB)], // blue-400 → blue-600
    'AED': [Color(0xFFF87171), Color(0xFFDC2626)], // red-400 → red-600
    'EGP': [Color(0xFFFACC15), Color(0xFFEA580C)], // yellow-400 → orange-600
  };

  /// التدرّج الافتراضي للعملات غير المعروفة (gray-400 → gray-600).
  static const List<Color> defaultCurrencyGradient = [
    Color(0xFF9CA3AF),
    Color(0xFF4B5563),
  ];
}
