import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/ads/ads_service.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/l10n/language_controller.dart';
import '../../../../core/l10n/translations.dart';
import '../../../converter/presentation/widgets/currency_converter.dart';
import '../../../exchange_rates/presentation/providers/exchange_rates_providers.dart';
import '../../../exchange_rates/presentation/widgets/currency_card.dart';
import '../../../exchange_rates/domain/entities/exchange_rate.dart';
import '../../../gold_prices/presentation/widgets/gold_prices_section.dart';
import '../../../refresh/presentation/widgets/manual_refresh_button.dart';

/// تبويبات المحتوى الرئيسي (عملات / ذهب / محول) — تعادل CurrencyTabs.tsx.
class CurrencyTabs extends ConsumerStatefulWidget {
  const CurrencyTabs(
      {super.key, required this.selectedCity, required this.language});

  /// المدينة المختارة.
  final String selectedCity;

  /// اللغة الحالية.
  final Language language;

  @override
  ConsumerState<CurrencyTabs> createState() => _CurrencyTabsState();
}

class _CurrencyTabsState extends ConsumerState<CurrencyTabs> {
  int _activeTab = 0; // 0 = عملات، 1 = ذهب، 2 = محول

  @override
  Widget build(BuildContext context) {
    final language = widget.language;
    final isArabic = language == Language.ar;
    final ratesAsync = ref.watch(exchangeRatesProvider(widget.selectedCity));

    return Container(
      color: const Color(0x8C733F27), // bg-[#733f27]/55
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // زر التحديث اليدوي.
          const Center(child: ManualRefreshButton()),
          const SizedBox(height: 10),

          // ترويسات التبويبات.
          Container(
            decoration: BoxDecoration(
              color: const Color(0x3392400E), // amber-800/20
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0x4DD97706)),
            ),
            child: Row(
              children: [
                _tabButton(
                  index: 0,
                  icon: Icons.attach_money,
                  label: translate('currencies', language),
                  activeGradient: const [
                    Color(0xFFD97706),
                    Color(0xFFCA8A04)
                  ],
                ),
                _tabButton(
                  index: 1,
                  icon: Icons.monetization_on,
                  label: translate('gold', language),
                  activeGradient: const [
                    Color(0xFFEAB308),
                    Color(0xFFF97316)
                  ],
                  onTap: () =>
                      ref.read(adsServiceProvider).showInterstitial(),
                ),
                _tabButton(
                  index: 2,
                  icon: Icons.calculate,
                  label: translate('converter', language),
                  activeGradient: const [
                    Color(0xFF3B82F6),
                    Color(0xFF6366F1)
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // محتوى التبويب.
          ConstrainedBox(
            constraints: const BoxConstraints(),
            child: _buildTabContent(isArabic),
          ),

          const SizedBox(height: 16),
          _buildUpdateStatus(isArabic, ratesAsync),
        ],
      ),
    );
  }

  /// زر تبويب واحد.
  Widget _tabButton({
    required int index,
    required IconData icon,
    required String label,
    required List<Color> activeGradient,
    VoidCallback? onTap,
  }) {
    final active = _activeTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() => _activeTab = index);
          onTap?.call();
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            gradient: active ? LinearGradient(colors: activeGradient) : null,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon,
                  size: 20,
                  color: active ? Colors.white : Colors.white70),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  label,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: active ? Colors.white : Colors.white70,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// محتوى التبويب النشط.
  Widget _buildTabContent(bool isArabic) {
    switch (_activeTab) {
      case 1:
        return Column(
          children: [
            _sectionHeader(
              icon: Icons.monetization_on,
              title:
                  '${translate('goldPrices', widget.language)} - ${cityDisplayName(widget.selectedCity, widget.language)}',
              subtitle: isArabic
                  ? 'اضغط تحديث يدوي للحصول على أحدث الأسعار'
                  : 'Press Manual Refresh for latest prices',
              dotColor: const Color(0xFFEAB308),
            ),
            GoldPricesSection(
                city: widget.selectedCity, language: widget.language),
          ],
        );
      case 2:
        return Column(
          children: [
            _sectionHeader(
              icon: Icons.calculate,
              title:
                  '${translate('currencyConverter', widget.language)} - ${cityDisplayName(widget.selectedCity, widget.language)}',
              subtitle: translate('accurateConversion', widget.language),
              dotColor: const Color(0xFF3B82F6),
            ),
            Consumer(
              builder: (context, ref, _) {
                final ratesAsync =
                    ref.watch(exchangeRatesProvider(widget.selectedCity));
                return CurrencyConverter(
                  rates: ratesAsync.value ?? const [],
                  language: widget.language,
                );
              },
            ),
          ],
        );
      default:
        return _buildCurrenciesTab(isArabic);
    }
  }

  /// تبويب العملات: تحميل/خطأ/شبكة بطاقات.
  Widget _buildCurrenciesTab(bool isArabic) {
    final ratesAsync = ref.watch(exchangeRatesProvider(widget.selectedCity));

    // التحميل الأول.
    if (ratesAsync.isLoading && !ratesAsync.hasValue) {
      return const Center(
        child: SizedBox(
          width: 56,
          height: 56,
          child: CircularProgressIndicator(
              strokeWidth: 4, color: Color(0xFFEAB308)),
        ),
      );
    }

    // الخطأ بدون بيانات سابقة.
    if (ratesAsync.hasError && !ratesAsync.hasValue) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0x1AFEF2F2),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0x33FECACA)),
        ),
        child: Column(
          children: [
            const Text('⚠️', style: TextStyle(fontSize: 24)),
            Text(
              translate('errorLoading', widget.language),
              style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFFF87171)),
            ),
            const SizedBox(height: 4),
            Text(
              translate('tryAgain', widget.language),
              style: const TextStyle(fontSize: 13, color: Colors.white70),
            ),
          ],
        ),
      );
    }

    final rates = ratesAsync.value ?? [];
    final isSanaa = widget.selectedCity == AppConstants.citySanaa;

    return Column(
      children: [
        _sectionHeader(
          icon: Icons.attach_money,
          title:
              '${translate('exchangeRates', widget.language)} - ${cityDisplayName(widget.selectedCity, widget.language)}',
        ),
        if (rates.isEmpty)
          Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              isSanaa
                  ? 'No exchange rate data available'
                  : (isArabic
                      ? 'لا توجد بيانات أسعار صرف'
                      : 'No exchange rate data available'),
              style: const TextStyle(color: Colors.white60, fontSize: 15),
            ),
          )
        else
          LayoutBuilder(
            builder: (context, constraints) {
              // تجاوب الشبكة: 2/3/4 أعمدة حسب العرض (بطاقات أصغر على الهاتف
              // لإظهار محتوى كافٍ دون تمرير).
              final width = constraints.maxWidth;
              final crossAxisCount = width > 1200
                  ? 4
                  : width > 700
                      ? 3
                      : 2;
              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: crossAxisCount,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.88,
                ),
                itemCount: rates.length,
                itemBuilder: (context, index) => CurrencyCard(
                  rate: rates[index],
                  language: widget.language,
                  variant: isSanaa
                      ? CurrencyCardVariant.sanaa
                      : CurrencyCardVariant.aden,
                ),
              );
            },
          ),
      ],
    );
  }

  /// ترويسة قسم داخل تبويب (صندوق زجاجي بعنوان وأيقونة).
  Widget _sectionHeader({
    required IconData icon,
    required String title,
    String? subtitle,
    Color dotColor = const Color(0xFFEAB308),
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0x3392400E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x4DD97706)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 20, color: const Color(0xFFFACC15)),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 7,
                  height: 7,
                  decoration: BoxDecoration(
                      color: dotColor, shape: BoxShape.circle),
                ),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    subtitle,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                        color: Colors.white70, fontSize: 11),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  /// لوحة حالة التحديث السفلية (المصادر وآخر تحديث).
  ///
  /// يعرض التاريخ الكامل **مرة واحدة فقط** لآخر تحديث فعلي للبيانات (أحدث
  /// updatedAt بين العملات المحمّلة) بدلاً من التكرار تحت كل بطاقة عملة.
  Widget _buildUpdateStatus(
      bool isArabic, AsyncValue<List<ExchangeRate>> ratesAsync) {
    final rates = ratesAsync.value ?? const <ExchangeRate>[];
    DateTime? latest;
    for (final rate in rates) {
      if (latest == null || rate.updatedAt.isAfter(latest)) {
        latest = rate.updatedAt;
      }
    }
    final lastUpdateText = DateFormat('MM/dd/yyyy, hh:mm a', 'en_US')
        .format(latest ?? DateTime.now());
    final isSanaa = widget.selectedCity == AppConstants.citySanaa;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0x1A92400E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x33D97706)),
      ),
      child: Column(
        children: [
          Text(
            '📊 ${translate('manualUpdate', widget.language)} - ${translate('lastUpdate', widget.language)}: $lastUpdateText',
            textAlign: TextAlign.center,
            style: const TextStyle(
                color: Colors.white70,
                fontSize: 13,
                fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0x1A92400E),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                Text(
                  isSanaa ? 'Sanaa City' : 'Aden City',
                  style: const TextStyle(
                      color: Colors.white70,
                      fontWeight: FontWeight.w500),
                ),
                if (isSanaa)
                  const Text(
                    'Currencies: ye-rial.com/sanaa\nGold: zoza.top',
                    textAlign: TextAlign.center,
                    style:
                        TextStyle(color: Colors.white60, fontSize: 11),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
