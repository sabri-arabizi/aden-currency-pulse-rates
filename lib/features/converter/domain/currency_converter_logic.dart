import '../../exchange_rates/domain/entities/exchange_rate.dart';

// منطق تحويل العملات (طبقة Domain) — دالة نقية قابلة للاختبار.
//
// منقول حرفياً من CurrencyConverter.tsx:
// - YER ← أجنبية: المبلغ ÷ السعر (4 خانات عشرية).
// - أجنبية ← YER: المبلغ × السعر (خانتان عشريتان).
// - أجنبية ← أجنبية: عبر الريال اليمني (4 خانات عشرية).
// - نفس العملة: المبلغ كما هو (خانتان عشريتان).

/// نتيجة التحويل أو فشله.
class ConversionResult {
  const ConversionResult._({this.text, this.isError = false});

  /// نتيجة ناجحة بصيغة نصية جاهزة للعرض (مثل "12.3456 USD").
  factory ConversionResult.success(String text) =>
      ConversionResult._(text: text);

  /// فشل: المدخل غير صالح أو العملة غير موجودة.
  factory ConversionResult.error() =>
      const ConversionResult._(isError: true);

  /// النص المنسّق للنتيجة (null عند الفشل).
  final String? text;

  /// هل فشلت العملية؟
  final bool isError;
}

/// تنفيذ التحويل.
///
/// [amountText] نص المبلغ المدخل، [fromCurrency]/[toCurrency] رمزا العملتين،
/// [useBuyRate] استخدام سعر الشراء (true) أم البيع (false)،
/// [rates] أسعار الصرف الحالية للمدينة المختارة.
ConversionResult convertCurrency({
  required String amountText,
  required String fromCurrency,
  required String toCurrency,
  required bool useBuyRate,
  required List<ExchangeRate> rates,
}) {
  final inputAmount = double.tryParse(amountText);
  if (amountText.isEmpty || inputAmount == null) {
    return ConversionResult.error();
  }

  double rateOf(ExchangeRate rate) =>
      useBuyRate ? rate.buyPrice : rate.sellPrice;

  ExchangeRate? findRate(String code) {
    for (final rate in rates) {
      if (rate.currencyCode == code) return rate;
    }
    return null;
  }

  if (fromCurrency == 'YER' && toCurrency != 'YER') {
    // من الريال اليمني إلى عملة أجنبية.
    final target = findRate(toCurrency);
    if (target == null) return ConversionResult.error();
    final converted = inputAmount / rateOf(target);
    return ConversionResult.success(
        '${converted.toStringAsFixed(4)} $toCurrency');
  }

  if (fromCurrency != 'YER' && toCurrency == 'YER') {
    // من عملة أجنبية إلى الريال اليمني.
    final source = findRate(fromCurrency);
    if (source == null) return ConversionResult.error();
    final converted = inputAmount * rateOf(source);
    return ConversionResult.success(
        '${converted.toStringAsFixed(2)} YER');
  }

  if (fromCurrency != 'YER' && toCurrency != 'YER') {
    // بين عملتين أجنبيتين عبر الريال اليمني.
    final source = findRate(fromCurrency);
    final target = findRate(toCurrency);
    if (source == null || target == null) return ConversionResult.error();
    final sourceToYer = inputAmount * rateOf(source);
    final yerToTarget = sourceToYer / rateOf(target);
    return ConversionResult.success(
        '${yerToTarget.toStringAsFixed(4)} $toCurrency');
  }

  // نفس العملة (YER ← YER).
  return ConversionResult.success(
      '${inputAmount.toStringAsFixed(2)} $toCurrency');
}
