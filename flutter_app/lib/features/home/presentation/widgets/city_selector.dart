import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/ads/ads_service.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/l10n/language_controller.dart';
import '../../../../core/l10n/translations.dart';
import '../../domain/entities/city_slide.dart';
import '../providers/city_slides_provider.dart';
import '../providers/selected_city_provider.dart';

/// منتقي المدينة: زران بصورتين (صنعاء/عدن) — يعادل قسم اختيار المدينة
/// في Index.tsx. اختيار مدينة يُظهر إعلان بانر (كما في الأصل).
class CitySelector extends ConsumerWidget {
  const CitySelector({super.key, this.compact = false});

  /// وضع مضغوط لأزرار أصغر (بدون العنوان) ليُستخدم فوق السلايدر كخلفية.
  final bool compact;

  /// يبحث عن شريحة مدينة حسب الاسم (عربي أو إنجليزي) لإيجاد صورتها السحابية.
  CitySlide? _slideForName(List<CitySlide> slides, String ar, String en) {
    for (final s in slides) {
      if (s.nameAr == ar || s.nameEn == en) return s;
    }
    return null;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedCity = ref.watch(selectedCityProvider);
    final language = ref.watch(languageProvider);

    final imageSize = compact ? 64.0 : 112.0;
    final labelSize = compact ? 13.0 : 18.0;

    // صور المدن من السحابة (city_slides) مع احتياط محلي.
    final slides = ref.watch(citySlidesProvider).value ?? defaultCitySlides;
    final sanaaSlide = _slideForName(slides, 'صنعاء', 'Sanaa');
    final adenSlide = _slideForName(slides, 'عدن', 'Aden');

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (!compact) ...[
          Text(
            translate('selectCity', language),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w300,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 24),
        ],
        Container(
          padding: EdgeInsets.symmetric(
            horizontal: compact ? 16 : 24,
            vertical: compact ? 8 : 16,
          ),
          decoration: BoxDecoration(
            color: const Color(0xD9FFD100), // bg-[#ffd100]/85
            borderRadius: BorderRadius.circular(999),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _cityButton(
                context,
                ref,
                city: AppConstants.citySanaa,
                image: 'assets/images/sanaa.jpg',
                imageUrl: sanaaSlide?.imageUrl,
                selected: selectedCity == AppConstants.citySanaa,
                language: language,
                indicatorColors: const [Color(0xFFC084FC), Color(0xFFF472B6)],
                imageSize: imageSize,
                labelSize: labelSize,
              ),
              SizedBox(width: compact ? 16 : 32),
              _cityButton(
                context,
                ref,
                city: AppConstants.cityAden,
                image: 'assets/images/aden.jpg',
                imageUrl: adenSlide?.imageUrl,
                selected: selectedCity == AppConstants.cityAden,
                language: language,
                indicatorColors: const [Color(0xFF60A5FA), Color(0xFF22D3EE)],
                imageSize: imageSize,
                labelSize: labelSize,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _cityButton(
    BuildContext context,
    WidgetRef ref, {
    required String city,
    required String image,
    String? imageUrl,
    required bool selected,
    required Language language,
    required List<Color> indicatorColors,
    required double imageSize,
    required double labelSize,
  }) {
    final hasRemote = imageUrl != null && imageUrl.trim().isNotEmpty;
    return GestureDetector(
      onTap: () {
        ref.read(selectedCityProvider.notifier).select(city);
        // إظهار البانر عند اختيار المدينة (مطابق للأصل).
        ref.read(adsServiceProvider).showBanner();
      },
      child: AnimatedScale(
        scale: selected ? 1.1 : 1.0,
        duration: const Duration(milliseconds: 400),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: imageSize,
              height: imageSize,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(compact ? 16 : 24),
                border:
                    Border.all(color: Colors.white, width: compact ? 2 : 3),
                boxShadow: const [
                  BoxShadow(
                      color: Colors.black38, blurRadius: 12, offset: Offset(0, 4)),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: hasRemote
                  ? CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.cover,
                      placeholder: (_, __) =>
                          const ColoredBox(color: Colors.white24),
                      errorWidget: (_, __, ___) => Image.asset(
                        image,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const ColoredBox(
                          color: Colors.white24,
                          child: Icon(Icons.location_city,
                              color: Colors.white70),
                        ),
                      ),
                    )
                  : Image.asset(
                      image,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const ColoredBox(
                        color: Colors.white24,
                        child:
                            Icon(Icons.location_city, color: Colors.white70),
                      ),
                    ),
            ),
            SizedBox(height: compact ? 6 : 12),
            Text(
              cityDisplayName(city, language),
              style: TextStyle(
                color: Colors.white,
                fontSize: labelSize,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: compact ? 3 : 6),
            AnimatedOpacity(
              opacity: selected ? 1 : 0,
              duration: const Duration(milliseconds: 300),
              child: Container(
                width: compact ? 28 : 40,
                height: compact ? 4 : 6,
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: indicatorColors),
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}