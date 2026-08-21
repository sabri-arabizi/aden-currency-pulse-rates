import '../../domain/entities/gold_price.dart';

/// نموذج بيانات سعر الذهب (طبقة Data) مع دعم JSON.
class GoldPriceModel extends GoldPrice {
  const GoldPriceModel({
    required super.id,
    required super.type,
    required super.buyPrice,
    required super.sellPrice,
    required super.city,
    required super.updatedAt,
    required super.isStale,
  });

  /// بناء النموذج من صف PostgREST مع تمرير علامة "قديم" المحسوبة.
  factory GoldPriceModel.fromJson(
    Map<String, dynamic> json, {
    required bool isStale,
  }) {
    return GoldPriceModel(
      id: json['id'].toString(),
      type: (json['type'] ?? '').toString(),
      buyPrice: (json['buy_price'] as num).toDouble(),
      sellPrice: (json['sell_price'] as num).toDouble(),
      city: (json['city'] ?? '').toString(),
      updatedAt: DateTime.parse(json['updated_at'].toString()),
      isStale: isStale,
    );
  }

  /// تحويل النموذج إلى خريطة JSON.
  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'buy_price': buyPrice,
        'sell_price': sellPrice,
        'city': city,
        'updated_at': updatedAt.toIso8601String(),
      };
}
