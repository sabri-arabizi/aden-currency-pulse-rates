import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/l10n/language_controller.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/time_ago.dart';
import '../../domain/entities/gold_price.dart';
import '../../domain/gold_display.dart';

/// بطاقة سعر ذهب — تعادل GoldCard.tsx (شارة "قديم"، ألوان الحالة).
class GoldCard extends StatelessWidget {
  const GoldCard({super.key, required this.gold, required this.language});

  /// سعر الذهب المعروض.
  final GoldPrice gold;

  /// اللغة الحالية.
  final Language language;

  @override
  Widget build(BuildContext context) {
    final isArabic = language == Language.ar;
    final isStale = gold.isStale;

    // ألوان الحالة (رمادي عند القدم، كهرماني لجنيه الذهب، أصفر للعيارات).
    final Color barColor;
    final List<Color> badgeGradient;
    if (isStale) {
      barColor = const Color(0xFF9CA3AF);
      badgeGradient = const [Color(0xFF9CA3AF), Color(0xFF6B7280)];
    } else if (gold.isGoldPound) {
      barColor = const Color(0xFFD97706);
      badgeGradient = const [Color(0xFFF59E0B), Color(0xFFB45309)];
    } else {
      barColor = const Color(0xFFEAB308);
      badgeGradient = const [Color(0xFFFACC15), Color(0xFFCA8A04)];
    }

    final titleColor =
        isStale ? const Color(0xFF6B7280) : const Color(0xFF1F2937);
    final timeText = DateFormat(
      'hh:mm a',
      isArabic ? 'ar' : 'en_US',
    ).format(gold.updatedAt);

    return Stack(
      children: [
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: BorderDirectional(
              start: BorderSide(color: barColor, width: 4),
            ),
            boxShadow: const [
              BoxShadow(
                  color: Colors.black12, blurRadius: 6, offset: Offset(0, 2)),
            ],
          ),
          foregroundDecoration: isStale
              ? BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(12),
                )
              : null,
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // شارة العيار.
              Container(
                width: 40,
                height: 30,
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: badgeGradient),
                  borderRadius: BorderRadius.circular(4),
                ),
                alignment: Alignment.center,
                child: Text(
                  goldKaratDisplay(gold.type),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                goldTypeDisplay(gold.type, language),
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: titleColor,
                ),
              ),
              Text(
                isArabic
                    ? 'سعر الجرام بالريال اليمني'
                    : 'Price per gram in YER',
                style:
                    const TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                      child: _priceBox(
                          label: isArabic ? 'شراء' : 'Buy',
                          price: gold.buyPrice,
                          isBuy: true,
                          isStale: isStale)),
                  const SizedBox(width: 8),
                  Expanded(
                      child: _priceBox(
                          label: isArabic ? 'بيع' : 'Sell',
                          price: gold.sellPrice,
                          isBuy: false,
                          isStale: isStale)),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.schedule,
                      size: 12,
                      color: isStale
                          ? const Color(0xFFEA580C)
                          : const Color(0xFF9CA3AF)),
                  const SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      '${isStale ? '⚠️ ' : ''}'
                      '${goldTimeAgo(gold.updatedAt, language)} - $timeText',
                      style: TextStyle(
                        fontSize: 10,
                        color: isStale
                            ? const Color(0xFFEA580C)
                            : const Color(0xFF9CA3AF),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        if (isStale)
          PositionedDirectional(
            top: 8,
            end: 8,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFFFFEDD5),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.warning_amber,
                      size: 12, color: Color(0xFFC2410C)),
                  const SizedBox(width: 3),
                  Text(
                    isArabic ? 'قديم' : 'Stale',
                    style: const TextStyle(
                        fontSize: 10, color: Color(0xFFC2410C)),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  /// صندوق سعر الذهب (شراء/بيع).
  Widget _priceBox({
    required String label,
    required double price,
    required bool isBuy,
    required bool isStale,
  }) {
    final bg = isStale
        ? const Color(0xFFF9FAFB)
        : (isBuy ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2));
    final border = isStale
        ? const Color(0xFFE5E7EB)
        : (isBuy ? const Color(0xFFBBF7D0) : const Color(0xFFFECACA));
    final color = isStale
        ? const Color(0xFF4B5563)
        : (isBuy ? const Color(0xFF166534) : const Color(0xFF991B1B));

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: border),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(isBuy ? Icons.trending_down : Icons.trending_up,
                  size: 14, color: color),
              const SizedBox(width: 3),
              Text(label,
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: color)),
            ],
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              formatGoldPrice(price),
              style: TextStyle(
                  fontSize: 15, fontWeight: FontWeight.bold, color: color),
            ),
          ),
        ],
      ),
    );
  }
}
