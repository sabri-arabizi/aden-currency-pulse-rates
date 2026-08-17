import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/dio_client.dart';
import '../../domain/gold_freshness.dart';
import '../models/gold_price_model.dart';

/// مصدر البيانات البعيد لأسعار الذهب: قراءة جدول gold_prices
/// عبر Supabase PostgREST باستخدام Dio.
class GoldPricesRemoteDataSource {
  const GoldPricesRemoteDataSource(this._client);

  final DioClient _client;

  /// جلب أسعار الذهب لمدينة معيّنة:
  /// تصفية الأنواع الأربعة المعتمدة + حساب علامة "قديم" (أقدم من 24 ساعة)
  /// — مطابق لمنطق useGoldPrices في تطبيق الويب.
  Future<List<GoldPriceModel>> fetchGoldPrices(String city) async {
    final data = await _client.get(
      '${ApiConstants.restBaseUrl}/${ApiConstants.goldPricesTable}',
      queryParameters: {
        'select': '*',
        'city': 'eq.$city',
        'order': 'updated_at.desc',
      },
    );

    final now = DateTime.now();
    return (data as List<dynamic>)
        .map((row) => row as Map<String, dynamic>)
        .where((row) =>
            AppConstants.validGoldTypes.contains(row['type'].toString()))
        .map((row) {
          final updatedAt = DateTime.parse(row['updated_at'].toString());
          return GoldPriceModel.fromJson(
            row,
            isStale: isGoldStale(updatedAt, now: now),
          );
        })
        .toList();
  }
}

/// مزوّد مصدر البيانات البعيد لأسعار الذهب.
final goldPricesRemoteDsProvider = Provider<GoldPricesRemoteDataSource>(
  (ref) => GoldPricesRemoteDataSource(ref.watch(dioClientProvider)),
);
