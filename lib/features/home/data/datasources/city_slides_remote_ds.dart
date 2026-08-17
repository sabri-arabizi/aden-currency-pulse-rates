import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/dio_client.dart';
import '../models/city_slide_model.dart';

/// مصدر البيانات البعيد لشرائح المدن: قراءة جدول city_slides
/// عبر Supabase PostgREST باستخدام Dio (مطابق لبقية مصادر البيانات).
class CitySlidesRemoteDataSource {
  const CitySlidesRemoteDataSource(this._client);

  final DioClient _client;

  /// جلب قائمة المدن (ومعها روابط الصور السحابية) مرتبة حسب الحقل order.
  Future<List<CitySlideModel>> fetchSlides() async {
    final data = await _client.get(
      '${ApiConstants.restBaseUrl}/city_slides',
      queryParameters: {
        'select': '*',
        'order': 'order.asc',
      },
    );

    return (data as List<dynamic>)
        .map((row) => CitySlideModel.fromJson(row as Map<String, dynamic>))
        .toList();
  }
}

/// مزوّد مصدر البيانات البعيد لشرائح المدن.
final citySlidesRemoteDsProvider = Provider<CitySlidesRemoteDataSource>(
  (ref) => CitySlidesRemoteDataSource(ref.watch(dioClientProvider)),
);
