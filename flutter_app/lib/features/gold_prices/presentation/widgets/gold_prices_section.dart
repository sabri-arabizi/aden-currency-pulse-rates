import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/l10n/language_controller.dart';
import '../../../../core/l10n/translations.dart';
import '../providers/gold_prices_providers.dart';
import 'gold_card.dart';

/// قسم أسعار الذهب مع حالات التحميل/الخطأ/الفراغ/البيانات القديمة —
/// يعادل GoldPricesSection.tsx.
class GoldPricesSection extends ConsumerWidget {
  const GoldPricesSection(
      {super.key, required this.city, required this.language});

  /// المدينة المختارة.
  final String city;

  /// اللغة الحالية.
  final Language language;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isArabic = language == Language.ar;
    final goldAsync = ref.watch(goldPricesProvider(city));

    // التحميل الأول (بدون بيانات سابقة).
    if (goldAsync.isLoading && !goldAsync.hasValue) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 32),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                color: Color(0xFFEAB308),
              ),
            ),
            const SizedBox(width: 12),
            Text(
              isArabic
                  ? 'جاري جلب أسعار الذهب...'
                  : 'Loading gold prices...',
              style:
                  const TextStyle(color: Color(0xFF4B5563), fontSize: 14),
            ),
          ],
        ),
      );
    }

    // الخطأ (بدون بيانات سابقة).
    if (goldAsync.hasError && !goldAsync.hasValue) {
      return _alert(
        color: Colors.red,
        title: isArabic ? 'خطأ' : 'Error',
        message: isArabic
            ? 'حدث خطأ في جلب أسعار الذهب. يرجى المحاولة مرة أخرى.'
            : 'Failed to fetch gold prices. Please try again.',
        icon: Icons.error_outline,
      );
    }

    final goldPrices = goldAsync.value ?? [];

    // لا توجد بيانات.
    if (goldPrices.isEmpty) {
      return _alert(
        color: Colors.orange,
        title: isArabic ? 'لا توجد بيانات حديثة' : 'No Fresh Data Available',
        message: isArabic
            ? 'لا توجد أسعار ذهب حديثة لمدينة ${cityDisplayName(city, language)}. اضغط على زر "تحديث يدوي" للحصول على أحدث الأسعار.'
            : 'No recent gold prices available for ${cityDisplayName(city, language)}. Press "Manual Refresh" to get the latest prices.',
        icon: Icons.refresh,
      );
    }

    final hasStaleData = goldPrices.any((g) => g.isStale);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (hasStaleData)
          _alert(
            color: Colors.orange,
            title: isArabic ? 'تنبيه: بيانات قديمة' : 'Warning: Stale Data',
            message: isArabic
                ? 'الأسعار المعروضة قد تكون قديمة. اضغط على "تحديث يدوي" للحصول على أحدث الأسعار.'
                : 'Displayed prices may be outdated. Press "Manual Refresh" to get the latest prices.',
            icon: Icons.error_outline,
          ),
        LayoutBuilder(
          builder: (context, constraints) {
            // عمودان للهواتف، وأكثر للشاشات العريضة (تجاوب مشابه للويب).
            final crossAxisCount = constraints.maxWidth > 900
                ? 4
                : constraints.maxWidth > 600
                    ? 3
                    : 2;
            return GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: crossAxisCount,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.85,
              ),
              itemCount: goldPrices.length,
              itemBuilder: (context, index) => GoldCard(
                gold: goldPrices[index],
                language: language,
              ),
            );
          },
        ),
      ],
    );
  }

  /// تنبيه ملوّن موحد (خطأ/تحذير).
  Widget _alert({
    required MaterialColor color,
    required String title,
    required String message,
    required IconData icon,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.shade300),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: color.shade700),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: color.shade800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(message,
                    style:
                        TextStyle(fontSize: 13, color: color.shade700)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
