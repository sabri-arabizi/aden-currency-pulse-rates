import '../../../core/l10n/language_controller.dart';

// تسميات عرض أنواع الذهب (منقولة من GoldCard.tsx).

/// اسم النوع للعرض: 'جنيه ذهب' → 'Gold Pound'، 'عيار 21' → '21 Karat'
/// في الإنجليزية؛ ويبقى كما هو في العربية.
String goldTypeDisplay(String type, Language language) {
  if (type == 'جنيه ذهب') {
    return language == Language.ar ? 'جنيه ذهب' : 'Gold Pound';
  }
  if (language == Language.ar) return type;
  final karatMatch = RegExp(r'عيار\s*(\d+)').firstMatch(type);
  if (karatMatch != null) return '${karatMatch.group(1)} Karat';
  return type;
}

/// الرمز المختصر المعروض داخل الشارة: رقم العيار، '£' لجنيه الذهب،
/// و 'Au' لأي نوع آخر.
String goldKaratDisplay(String type) {
  if (type == 'جنيه ذهب') return '£';
  final karatMatch = RegExp(r'عيار\s*(\d+)').firstMatch(type);
  if (karatMatch != null) return karatMatch.group(1)!;
  return 'Au';
}
