import '../../domain/entities/exchange_rate.dart';

/// نموذج بيانات سعر الصرف (طبقة Data) مع دعم JSON.
class ExchangeRateModel extends ExchangeRate {
  const ExchangeRateModel({
    required super.id,
    required super.currencyCode,
    required super.currencyName,
    required super.buyPrice,
    required super.sellPrice,
    required super.flagUrl,
    required super.city,
    required super.updatedAt,
  });

  /// بناء النموذج من صف PostgREST.
  factory ExchangeRateModel.fromJson(Map<String, dynamic> json) {
    return ExchangeRateModel(
      id: json['id'].toString(),
      currencyCode: (json['currency_code'] ?? '').toString(),
      currencyName: (json['currency_name'] ?? '').toString(),
      buyPrice: (json['buy_price'] as num).toDouble(),
      sellPrice: (json['sell_price'] as num).toDouble(),
      flagUrl: (json['flag_url'] ?? '').toString(),
      city: (json['city'] ?? '').toString(),
      updatedAt: DateTime.parse(json['updated_at'].toString()),
    );
  }

  /// تحويل النموذج إلى خريطة JSON.
  Map<String, dynamic> toJson() => {
        'id': id,
        'currency_code': currencyCode,
        'currency_name': currencyName,
        'buy_price': buyPrice,
        'sell_price': sellPrice,
        'flag_url': flagUrl,
        'city': city,
        'updated_at': updatedAt.toIso8601String(),
      };
}
