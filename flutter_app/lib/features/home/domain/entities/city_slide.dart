/// كيان شريحة مدينة (للسلايدر/الأزرار) — يُجلب من جدول city_slides.
class CitySlide {
  const CitySlide({
    required this.id,
    required this.order,
    required this.nameAr,
    required this.nameEn,
    this.imageUrl,
  });

  /// المعرّف في قاعدة البيانات.
  final int id;

  /// ترتيب العرض (صاعد).
  final int order;

  /// اسم المدينة بالعربية.
  final String nameAr;

  /// اسم المدينة بالإنجليزية.
  final String nameEn;

  /// رابط صورة المدينة السحابي (Supabase Storage / CDN).
  final String? imageUrl;

  /// هل توجد صورة سحابية؟
  bool get hasRemoteImage => imageUrl != null && imageUrl!.trim().isNotEmpty;
}
