import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/city_slides_remote_ds.dart';
import '../../domain/entities/city_slide.dart';

/// الشرائح الافتراضية (تُستخدم عند فشل الاتصال أو خلوّ جدول city_slides).
const List<CitySlide> defaultCitySlides = [
  CitySlide(id: 1, order: 0, nameAr: 'صنعاء', nameEn: 'Sanaa'),
  CitySlide(id: 2, order: 1, nameAr: 'عدن', nameEn: 'Aden'),
  CitySlide(id: 3, order: 2, nameAr: 'تعز', nameEn: 'Taiz'),
  CitySlide(id: 4, order: 3, nameAr: 'الحديدة', nameEn: 'Hodeidah'),
  CitySlide(id: 5, order: 4, nameAr: 'إب', nameEn: 'Ibb'),
  CitySlide(id: 6, order: 5, nameAr: 'المكلا', nameEn: 'Mukalla'),
];

/// أصول الصور المحلية الاحتياطية (مطابقة افتراضياً لترتيب defaultCitySlides).
const List<String> defaultCityAssets = [
  'assets/images/gallery/sanaa.gif',
  'assets/images/gallery/aden.gif',
  'assets/images/gallery/taiz.gif',
  'assets/images/gallery/hodeidah.gif',
  'assets/images/gallery/ibb.gif',
  'assets/images/gallery/mukalla.gif',
];

/// مزوّد قائمة المدن: يُجلب من السحابة (جدول city_slides) ويحمل صورها
/// من Supabase Storage، مع الرجوع للقيم المحلية عند أي فشل أو خلوّ.
final citySlidesProvider = FutureProvider<List<CitySlide>>((ref) async {
  final ds = ref.watch(citySlidesRemoteDsProvider);
  try {
    final slides = await ds.fetchSlides();
    if (slides.isNotEmpty) return slides;
  } catch (_) {
    // عدم الاتصال أو خطأ: نعود للقيم المحلية.
  }
  return defaultCitySlides;
});
