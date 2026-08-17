/// دوال "منذ متى" مطابقة حرفياً للنصوص في مكونات الويب.
library;

import '../l10n/language_controller.dart';

/// نمط بطاقة عدن (CurrencyCard.tsx) — عربي دائماً:
/// 'الآن' / 'منذ X دقيقة' / 'منذ X ساعة'.
String adenTimeAgo(DateTime updatedAt, {DateTime? now}) {
  final current = now ?? DateTime.now();
  final diffMinutes = current.difference(updatedAt).inMinutes;
  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return 'منذ $diffMinutes دقيقة';
  return 'منذ ${diffMinutes ~/ 60} ساعة';
}

/// نمط بطاقات صنعاء (SanaaCurrencyCards.tsx) — إنجليزي دائماً:
/// 'Now' / 'Xm ago' / 'Xh ago'.
String sanaaTimeAgo(DateTime updatedAt, {DateTime? now}) {
  final current = now ?? DateTime.now();
  final diffMinutes = current.difference(updatedAt).inMinutes;
  if (diffMinutes < 1) return 'Now';
  if (diffMinutes < 60) return '${diffMinutes}m ago';
  return '${diffMinutes ~/ 60}h ago';
}

/// نمط بطاقة الذهب (GoldCard.tsx) — ثنائي اللغة مع دعم الأيام.
String goldTimeAgo(DateTime updatedAt, Language language, {DateTime? now}) {
  final current = now ?? DateTime.now();
  final diffMinutes = current.difference(updatedAt).inMinutes;
  final isAr = language == Language.ar;
  if (diffMinutes < 1) return isAr ? 'الآن' : 'Just now';
  if (diffMinutes < 60) {
    return isAr ? 'منذ $diffMinutes دقيقة' : '${diffMinutes}m ago';
  }
  final diffHours = diffMinutes ~/ 60;
  if (diffHours < 24) return isAr ? 'منذ $diffHours ساعة' : '${diffHours}h ago';
  final diffDays = diffHours ~/ 24;
  return isAr ? 'منذ $diffDays يوم' : '${diffDays}d ago';
}
