import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/l10n/language_controller.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/time_ago.dart';
import '../../domain/entities/exchange_rate.dart';

/// نمط البطاقة: عدن (CurrencyCard.tsx) أم صنعاء (SanaaCurrencyCards.tsx).
enum CurrencyCardVariant { aden, sanaa }

/// بطاقة عرض سعر عملة (شراء/بيع) — تعادل CurrencyCard.tsx و
/// SanaaCurrencyCards.tsx مع اختلافاتهما في التنسيق والنصوص.
class CurrencyCard extends StatelessWidget {
  const CurrencyCard({
    super.key,
    required this.rate,
    required this.language,
    required this.variant,
  });

  /// سعر الصرف المعروض.
  final ExchangeRate rate;

  /// اللغة الحالية.
  final Language language;

  /// نمط البطاقة (عدن/صنعاء).
  final CurrencyCardVariant variant;

  @override
  Widget build(BuildContext context) {
    final isArabic = language == Language.ar;
    final isAden = variant == CurrencyCardVariant.aden;
    final priceFormatter =
        isAden ? formatCurrencyPrice : formatSanaaCurrencyPrice;
    final timeAgoText = isAden
        ? adenTimeAgo(rate.updatedAt)
        : sanaaTimeAgo(rate.updatedAt);
    final dateText = DateFormat(
      'dd/MM/yyyy, hh:mm a',
      isArabic ? 'ar' : 'en_US',
    ).format(rate.updatedAt);

    return Container(
      decoration: BoxDecoration(
        color: isAden
            ? const Color(0x54E6E03B) // bg-[#e6e03b]/[0.33]
            : Colors.white.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(isAden ? 32 : 16),
        boxShadow: const [
          BoxShadow(color: Colors.black26, blurRadius: 12, offset: Offset(0, 4)),
        ],
      ),
      padding: const EdgeInsets.all(8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // الترويسة: العلم + الاسم + شارة "تلقائي".
          Row(
            children: [
              _flagWithBadge(),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      rate.currencyName,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    Text(
                      rate.currencyCode,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF4B5563),
                      ),
                    ),
                  ],
                ),
              ),
              if (rate.isAutoUpdated) _autoBadge(isArabic),
            ],
          ),
          const SizedBox(height: 8),
          // صناديق الشراء والبيع.
          Row(
            children: [
              Expanded(
                child: _priceBox(
                  label: isArabic ? 'شراء' : 'Buy',
                  price: priceFormatter(rate.buyPrice, rate.currencyCode),
                  isBuy: true,
                  isArabic: isArabic,
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _priceBox(
                  label: isArabic ? 'بيع' : 'Sell',
                  price: priceFormatter(rate.sellPrice, rate.currencyCode),
                  isBuy: false,
                  isArabic: isArabic,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          // وقت آخر تحديث.
          Container(
            padding: const EdgeInsets.symmetric(vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: Text(
              '${isArabic ? 'آخر تحديث:' : 'Last update:'} $timeAgoText',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 10, color: Color(0xFF6B7280)),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            dateText,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 10, color: Color(0xFF9CA3AF)),
          ),
        ],
      ),
    );
  }

  /// صورة العلم مع شارة البرق الخضراء للعملات المحدّثة تلقائياً.
  Widget _flagWithBadge() {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          width: 40,
          height: 26,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: Colors.white, width: 2),
            boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
          ),
          clipBehavior: Clip.antiAlias,
          child: CachedNetworkImage(
            imageUrl: rate.flagUrl,
            fit: BoxFit.cover,
            placeholder: (context, url) =>
                const ColoredBox(color: Color(0xFFE5E7EB)),
            errorWidget: (context, url, error) => const ColoredBox(
              color: Color(0xFFE5E7EB),
              child: Icon(Icons.flag, size: 16, color: Color(0xFF9CA3AF)),
            ),
          ),
        ),
        if (rate.isAutoUpdated)
          PositionedDirectional(
            top: -4,
            end: -4,
            child: Container(
              width: 15,
              height: 15,
              decoration: const BoxDecoration(
                color: Color(0xFF22C55E),
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 4)],
              ),
              child: const Icon(Icons.bolt, size: 9, color: Colors.white),
            ),
          ),
      ],
    );
  }

  /// شارة "تلقائي/Auto".
  Widget _autoBadge(bool isArabic) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: const Color(0xFFBBF7D0)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.schedule, size: 11, color: Color(0xFF16A34A)),
          const SizedBox(width: 3),
          Text(
            isArabic ? 'تلقائي' : 'Auto',
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: Color(0xFF16A34A),
            ),
          ),
        ],
      ),
    );
  }

  /// صندوق سعر (شراء أخضر / بيع أحمر).
  Widget _priceBox({
    required String label,
    required String price,
    required bool isBuy,
    required bool isArabic,
  }) {
    final bgStart = isBuy ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2);
    final bgEnd = isBuy ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2);
    final border = isBuy ? const Color(0xFFBBF7D0) : const Color(0xFFFECACA);
    final iconColor = isBuy ? const Color(0xFF16A34A) : const Color(0xFFDC2626);
    final labelColor = isBuy ? const Color(0xFF15803D) : const Color(0xFFB91C1C);
    final priceColor = isBuy ? const Color(0xFF166534) : const Color(0xFF991B1B);

    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [bgStart, bgEnd],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: border),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isBuy ? Icons.trending_down : Icons.trending_up,
                size: 16,
                color: iconColor,
              ),
              const SizedBox(width: 3),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: labelColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              price,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: priceColor,
              ),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            isArabic ? 'ريال يمني' : 'Yemeni Rial',
            style: TextStyle(fontSize: 9, color: iconColor),
          ),
        ],
      ),
    );
  }
}
