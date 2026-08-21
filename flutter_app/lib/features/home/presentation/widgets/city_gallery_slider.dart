import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/l10n/language_controller.dart';
import '../../../../core/l10n/translations.dart';
import '../providers/city_slides_provider.dart';

/// سلايدر صور متحركة تعبّر عن أبرز المدن اليمنية، موضوع تحت اختيار
/// المدينة (صنعاء وعدن). كاروسيل تلقائي + نقاط مؤشر + انتقالات متحركة.
/// تُحمَّل الصور/المدن من السحابة (city_slides) مع احتياط محلي.
class CityGallerySlider extends ConsumerStatefulWidget {
  const CityGallerySlider({super.key, this.compact = false});

  /// عندما يكون true يعرض السلايدر كخلفية ممتلئة (بدون عنوان/نقاط/شريط تقدم)
  /// ليُستخدم كخلفية شفافة خلف أزرار المدينة.
  final bool compact;

  @override
  ConsumerState<CityGallerySlider> createState() => _CityGallerySliderState();
}

class _CityGallerySliderState extends ConsumerState<CityGallerySlider> {
  final PageController _controller = PageController(viewportFraction: 0.92);
  Timer? _timer;
  int _current = 0;
  double _progress = 0; // 0→1 تقدم المؤقّت للتبديل التلقائي.

  static const int _autoPlayMs = 5000;

  /// عدد الشرائح الحالي (من السحابة أو الافتراضيات المحلية).
  int get _slideCount =>
      ref.read(citySlidesProvider).value?.length ?? defaultCitySlides.length;

  @override
  void initState() {
    super.initState();
    _startAutoPlay();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _startAutoPlay() {
    _timer?.cancel();
    final start = DateTime.now();
    _timer = Timer.periodic(const Duration(milliseconds: 40), (t) {
      if (!mounted) return;
      final elapsed = DateTime.now().difference(start);
      final ratio = (elapsed.inMilliseconds / _autoPlayMs).clamp(0.0, 1.0);
      setState(() => _progress = ratio);
      if (ratio >= 1.0) {
        _goToNext();
      }
    });
  }

  void _goToNext() {
    if (!mounted) return;
    final count = _slideCount;
    if (count == 0) return;
    final next = (_current + 1) % count;
    _controller.animateToPage(
      next,
      duration: const Duration(milliseconds: 550),
      curve: Curves.easeInOutCubic,
    );
    setState(() => _current = next);
    _startAutoPlay();
  }

  void _onPageChanged(int index) {
    if (!mounted) return;
    setState(() => _current = index);
    _startAutoPlay();
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final slides = ref.watch(citySlidesProvider).value ?? defaultCitySlides;

    // السلايدر نفسه (يُعاد استخدامه في الوضعين المضغوط والكامل).
    final Widget pageView = PageView.builder(
      controller: _controller,
      onPageChanged: _onPageChanged,
      itemCount: slides.length,
      itemBuilder: (context, index) {
        final slide = slides[index];
        return _SlideItem(
          imageUrl: slide.imageUrl,
          fallbackAsset: defaultCityAssets[index % defaultCityAssets.length],
          title: language == Language.ar ? slide.nameAr : slide.nameEn,
          accent: _accent(index),
        );
      },
    );

    // كخلفية ممتلئة: نُعيد السلايدر فقط دون أي عناصر واجهة إضافية.
    if (widget.compact) {
      return pageView;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        // العنوان الفرعي.
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                translate('yemenCities', language),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                translate('yemenTagline', language),
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // السلايدر نفسه.
        SizedBox(
          height: 210,
          child: pageView,
        ),
        const SizedBox(height: 10),

        // نقاط المؤشّر.
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            for (var i = 0; i < slides.length; i++)
              AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: _current == i ? 22 : 8,
                height: 8,
                decoration: BoxDecoration(
                  color: _current == i ? Colors.amber : Colors.white38,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
          ],
        ),
        const SizedBox(height: 6),

        // شريط تقدم التبديل التلقائي.
        LinearProgressIndicator(
          value: _progress,
          minHeight: 3,
          backgroundColor: Colors.white24,
          valueColor: const AlwaysStoppedAnimation<Color>(Colors.amber),
          borderRadius: BorderRadius.circular(999),
        ),
      ],
    );
  }

  Color _accent(int index) {
    const colors = [
      Color(0xFFF5B041), // صنعاء
      Color(0xFF22D3EE), // عدن
      Color(0xFF4ADE80), // تعز
      Color(0xFFF87171), // الحديدة
      Color(0xFFA78BFA), // إب
      Color(0xFF60A5FA), // المكلا
    ];
    return colors[index % colors.length];
  }
}
class _SlideItem extends StatelessWidget {
  const _SlideItem({
    required this.imageUrl,
    required this.fallbackAsset,
    required this.title,
    required this.accent,
  });

  /// رابط الصورة السحابي (قد يكون فارغاً فيلجأ للاحتياط المحلي).
  final String? imageUrl;

  /// مسار الصورة المحلية الاحتياطية.
  final String fallbackAsset;

  final String title;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    final hasRemote = imageUrl != null && imageUrl!.trim().isNotEmpty;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white24),
        boxShadow: const [
          BoxShadow(
            color: Colors.black38,
            blurRadius: 14,
            offset: Offset(0, 5),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // صورة المدينة (سحابية أو محلية احتياطية).
            if (hasRemote)
              CachedNetworkImage(
                imageUrl: imageUrl!,
                fit: BoxFit.cover,
                placeholder: (_, __) => Container(
                  color: accent.withValues(alpha: 0.45),
                ),
                errorWidget: (_, __, ___) => Image.asset(
                  fallbackAsset,
                  fit: BoxFit.cover,
                  gaplessPlayback: true,
                  errorBuilder: (_, __, ___) => Container(
                    color: accent.withValues(alpha: 0.55),
                    alignment: Alignment.center,
                    child: const Icon(
                      Icons.photo,
                      color: Colors.white,
                      size: 44,
                    ),
                  ),
                ),
              )
            else
              Image.asset(
                fallbackAsset,
                fit: BoxFit.cover,
                gaplessPlayback: true,
                errorBuilder: (_, __, ___) => Container(
                  color: accent.withValues(alpha: 0.55),
                  alignment: Alignment.center,
                  child: const Icon(
                    Icons.photo,
                    color: Colors.white,
                    size: 44,
                  ),
                ),
              ),
            // تدرّج سفلي لعكس النص.
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black54],
                ),
              ),
            ),
            // العنوان والأيقونة.
            Positioned(
              left: 14,
              right: 14,
              bottom: 12,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    width: 10,
                    height: 34,
                    decoration: BoxDecoration(
                      color: accent,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        shadows: [
                          Shadow(color: Colors.black, blurRadius: 6),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}