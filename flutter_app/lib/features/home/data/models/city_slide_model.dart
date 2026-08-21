import '../../domain/entities/city_slide.dart';

/// نموذج بيانات شريحة المدينة (طبقة Data) مع دعم JSON.
class CitySlideModel extends CitySlide {
  const CitySlideModel({
    required super.id,
    required super.order,
    required super.nameAr,
    required super.nameEn,
    super.imageUrl,
  });

  /// بناء النموذج من صف PostgREST.
  factory CitySlideModel.fromJson(Map<String, dynamic> json) {
    return CitySlideModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      order: (json['order'] as num?)?.toInt() ?? 0,
      nameAr: (json['name_ar'] ?? '').toString(),
      nameEn: (json['name_en'] ?? '').toString(),
      imageUrl: json['image_url'] as String?,
    );
  }

  /// تحويل النموذج إلى خريطة JSON.
  Map<String, dynamic> toJson() => {
        'id': id,
        'order': order,
        'name_ar': nameAr,
        'name_en': nameEn,
        'image_url': imageUrl,
      };
}
