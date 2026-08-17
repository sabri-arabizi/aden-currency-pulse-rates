import 'package:flutter/material.dart';

import '../../../../core/l10n/language_controller.dart';
import '../../../exchange_rates/domain/entities/exchange_rate.dart';
import '../../domain/currency_converter_logic.dart';

/// ودجت محوّل العملات — يعادل CurrencyConverter.tsx
/// (مبلغ + من/إلى + شراء/بيع + تبديل + نتيجة + إخلاء مسؤولية).
class CurrencyConverter extends StatefulWidget {
  const CurrencyConverter(
      {super.key, required this.rates, required this.language});

  /// أسعار الصرف الحالية للمدينة المختارة.
  final List<ExchangeRate> rates;

  /// اللغة الحالية.
  final Language language;

  @override
  State<CurrencyConverter> createState() => _CurrencyConverterState();
}

class _CurrencyConverterState extends State<CurrencyConverter> {
  final TextEditingController _amountController = TextEditingController();
  String _fromCurrency = 'YER';
  String _toCurrency = 'USD';
  bool _useBuyRate = true;
  String _result = '';

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  bool get _isArabic => widget.language == Language.ar;

  void _convert() {
    final result = convertCurrency(
      amountText: _amountController.text,
      fromCurrency: _fromCurrency,
      toCurrency: _toCurrency,
      useBuyRate: _useBuyRate,
      rates: widget.rates,
    );
    setState(() {
      _result = result.isError
          ? (_isArabic
              ? 'يرجى إدخال رقم صحيح'
              : 'Please enter a valid number')
          : result.text!;
    });
  }

  void _swap() {
    setState(() {
      final tmp = _fromCurrency;
      _fromCurrency = _toCurrency;
      _toCurrency = tmp;
      _result = '';
    });
  }

  @override
  Widget build(BuildContext context) {
    final isArabic = _isArabic;

    // العملات المتاحة: الريال اليمني + عملات الأسعار الحالية.
    final currencies = <({String code, String name, String flag})>[
      (
        code: 'YER',
        name: isArabic ? 'ريال يمني' : 'Yemeni Rial',
        flag: '🇾🇪',
      ),
      ...widget.rates.map((r) => (
            code: r.currencyCode,
            name: r.currencyName,
            flag: '🌍',
          )),
    ];

    // ضمان صلاحية القيم المختارة عند تغيّر قائمة الأسعار.
    if (!currencies.any((c) => c.code == _fromCurrency)) {
      _fromCurrency = 'YER';
    }
    if (!currencies.any((c) => c.code == _toCurrency)) {
      _toCurrency = 'YER';
    }

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 640),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.95),
            borderRadius: BorderRadius.circular(16),
            boxShadow: const [
              BoxShadow(
                  color: Colors.black26,
                  blurRadius: 16,
                  offset: Offset(0, 6)),
            ],
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // العنوان.
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.calculate,
                      size: 26, color: Color(0xFF2563EB)),
                  const SizedBox(width: 8),
                  Text(
                    isArabic ? 'محول العملات' : 'Currency Converter',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                isArabic
                    ? 'تحويل بين الريال اليمني والعملات الأخرى'
                    : 'Convert between Yemeni Rial and other currencies',
                textAlign: TextAlign.center,
                style:
                    const TextStyle(fontSize: 13, color: Color(0xFF4B5563)),
              ),
              const SizedBox(height: 20),

              // اختيار نوع السعر (شراء/بيع).
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _rateTypeButton(
                    label: isArabic ? 'سعر الشراء' : 'Buy Rate',
                    selected: _useBuyRate,
                    onTap: () => setState(() => _useBuyRate = true),
                  ),
                  const SizedBox(width: 12),
                  _rateTypeButton(
                    label: isArabic ? 'سعر البيع' : 'Sell Rate',
                    selected: !_useBuyRate,
                    onTap: () => setState(() => _useBuyRate = false),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // المبلغ.
              _fieldLabel(isArabic ? 'المبلغ' : 'Amount'),
              TextField(
                controller: _amountController,
                keyboardType: const TextInputType.numberWithOptions(
                    decimal: true),
                style: const TextStyle(fontSize: 17),
                decoration: InputDecoration(
                  hintText:
                      isArabic ? 'أدخل المبلغ' : 'Enter amount',
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8)),
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 12),
                ),
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: 16),

              // من.
              _fieldLabel(isArabic ? 'من' : 'From'),
              _currencyDropdown(
                value: _fromCurrency,
                currencies: currencies,
                onChanged: (v) => setState(() => _fromCurrency = v!),
              ),
              const SizedBox(height: 8),

              // زر التبديل.
              Center(
                child: IconButton(
                  onPressed: _swap,
                  icon: const Icon(Icons.swap_vert),
                  style: IconButton.styleFrom(
                    shape: const CircleBorder(
                        side: BorderSide(color: Color(0xFFD1D5DB))),
                  ),
                ),
              ),
              const SizedBox(height: 8),

              // إلى.
              _fieldLabel(isArabic ? 'إلى' : 'To'),
              _currencyDropdown(
                value: _toCurrency,
                currencies: currencies,
                onChanged: (v) => setState(() => _toCurrency = v!),
              ),
              const SizedBox(height: 16),

              // زر التحويل.
              FilledButton(
                onPressed:
                    _amountController.text.isEmpty ? null : _convert,
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  textStyle: const TextStyle(fontSize: 17),
                ),
                child: Text(isArabic ? 'تحويل' : 'Convert'),
              ),

              // النتيجة.
              if (_result.isNotEmpty) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [
                      Color(0xFFEFF6FF),
                      Color(0xFFEEF2FF),
                    ]),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFBFDBFE)),
                  ),
                  child: Column(
                    children: [
                      Text(
                        isArabic
                            ? 'نتيجة التحويل'
                            : 'Conversion Result',
                        style: const TextStyle(
                            fontSize: 13, color: Color(0xFF4B5563)),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _result,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E40AF),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        isArabic
                            ? 'باستخدام سعر ${_useBuyRate ? 'الشراء' : 'البيع'} • يتم تحديث الأسعار بانتظام'
                            : 'Using ${_useBuyRate ? 'buy' : 'sell'} rate • Rates updated regularly',
                        style: const TextStyle(
                            fontSize: 11, color: Color(0xFF6B7280)),
                      ),
                    ],
                  ),
                ),
              ],

              // إخلاء المسؤولية.
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEFCE8),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFFDE047)),
                ),
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: isArabic
                            ? 'إخلاء مسؤولية: '
                            : 'Disclaimer: ',
                        style:
                            const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      TextSpan(
                        text: isArabic
                            ? 'هذه الأسعار للأغراض الإعلامية فقط. قد تختلف أسعار الصرف الفعلية. يرجى تأكيد الأسعار الحالية قبل إجراء المعاملات.'
                            : 'These rates are for informational purposes only. Actual exchange rates may vary. Please confirm current rates before making transactions.',
                      ),
                    ],
                  ),
                  style: const TextStyle(
                      fontSize: 11, color: Color(0xFF854D0E)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// عنوان حقل صغير.
  Widget _fieldLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: Color(0xFF374151),
        ),
      ),
    );
  }

  /// زر اختيار نوع السعر (شراء/بيع).
  Widget _rateTypeButton({
    required String label,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return selected
        ? FilledButton(onPressed: onTap, child: Text(label))
        : OutlinedButton(onPressed: onTap, child: Text(label));
  }

  /// قائمة منسدلة لاختيار العملة.
  Widget _currencyDropdown({
    required String value,
    required List<({String code, String name, String flag})> currencies,
    required ValueChanged<String?> onChanged,
  }) {
    return DropdownButtonFormField<String>(
      initialValue: value,
      isExpanded: true,
      decoration: InputDecoration(
        border:
            OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      ),
      items: currencies
          .map((c) => DropdownMenuItem(
                value: c.code,
                child: Text('${c.flag} ${c.code} - ${c.name}',
                    overflow: TextOverflow.ellipsis),
              ))
          .toList(),
      onChanged: onChanged,
    );
  }
}
