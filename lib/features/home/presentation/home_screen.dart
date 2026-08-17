import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/ads/ads_service.dart';
import '../../../core/l10n/language_controller.dart';
import '../../../core/l10n/translations.dart';
import '../../../core/theme/app_colors.dart';
import 'providers/selected_city_provider.dart';
import 'widgets/city_gallery_slider.dart';
import 'widgets/city_selector.dart';
import 'widgets/currency_tabs.dart';
import 'widgets/language_toggle.dart';

/// الشاشة الرئيسية — تعادل Index.tsx:
/// أعلى الشاشة: سلايدر متحرك كخلفية (50% شفافية) + أزرار المدينة فوقه،
/// ثم التبويبات وشريط تنقل سفلي.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    final selectedCity = ref.watch(selectedCityProvider);

    // ودجت البانر (null على المنصات غير المدعومة).
    final banner = ref.read(adsServiceProvider).bannerAdWidget();

    return Container(
      decoration: const BoxDecoration(gradient: AppColors.backgroundGradient),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // أعلى الشاشة: السلايدر المتحرك كخلفية (80% ظهور) يمتد
                // حتى ربع ارتفاع الشاشة، وأزرار المدينة (صنعاء/عدن) فوقه.
                SizedBox(
                  // ارتفاع مضغوط (لا يتجاوز ربع الشاشة) ليتناسب المحتوى أدناه.
                  height:
                      (MediaQuery.of(context).size.height * 0.2).clamp(
                          150.0, 210.0),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      // السلايدر كخلفية بظهور 80%.
                      const Opacity(
                        opacity: 0.8,
                        child: CityGallerySlider(compact: true),
                      ),
                      // أزرار المدينة فوق السلايدر مباشرة.
                      const Center(child: CitySelector(compact: true)),
                      // مبدّل اللغة في الزاوية العلوية.
                      const Positioned(
                        top: 8,
                        right: 8,
                        child: LanguageToggle(),
                      ),
                    ],
                  ),
                ),

                // التبويبات (عملات/ذهب/محول).
                CurrencyTabs(selectedCity: selectedCity, language: language),

                // مساحة الشريط السفلي.
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
        // شريط التنقل السفلي (+ البانر عند توفره).
        bottomNavigationBar: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (banner != null) SizedBox(height: 60, child: banner),
            _BottomNav(language: language),
          ],
        ),
      ),
    );
  }
}

/// شريط التنقل السفلي: التواصل + الرئيسية.
class _BottomNav extends StatelessWidget {
  const _BottomNav({required this.language});

  final Language language;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0x8078350F), // amber-900/50
        border: Border(
          top: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
        ),
      ),
      padding: EdgeInsets.only(
        top: 10,
        bottom: MediaQuery.of(context).padding.bottom + 10,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _navItem(
            icon: Icons.phone,
            label: translate('contact', language),
            onTap: () => context.push('/contact'),
          ),
          _navItem(
            icon: Icons.home,
            label: translate('home', language),
            onTap: () {},
          ),
        ],
      ),
    );
  }

  Widget _navItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.all(6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [
                  const Color(0xFFFACC15).withValues(alpha: 0.2),
                  const Color(0xFFFB923C).withValues(alpha: 0.2),
                ]),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, size: 20, color: const Color(0xFFFACC15)),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFFFACC15)),
            ),
          ],
        ),
      ),
    );
  }
}
