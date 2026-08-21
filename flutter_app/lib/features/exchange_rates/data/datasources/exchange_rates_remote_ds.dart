import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/dio_client.dart';
import '../models/exchange_rate_model.dart';

/// مصدر البيانات البعيد لأسعار الصرف: قراءة جدول exchange_rates
/// عبر Supabase PostgREST باستخدام Dio.
class ExchangeRatesRemoteDataSource {
  const ExchangeRatesRemoteDataSource(this._client);

  final DioClient _client;

  /// جلب أسعار الصرف لمدينة معيّنة مع الترتيب حسب الأولوية
  /// (مطابق لمنطق useExchangeRates في تطبيق الويب).
  Future<List<ExchangeRateModel>> fetchRates(String city) async {
    final data = await _client.get(
      '${ApiConstants.restBaseUrl}/${ApiConstants.exchangeRatesTable}',
      queryParameters: {
        'select': '*',
        'city': 'eq.$city',
        'order': 'currency_code.asc',
      },
    );

    final models = (data as List<dynamic>)
        .map((row) =>
            ExchangeRateModel.fromJson(row as Map<String, dynamic>))
        .toList();

    // ترتيب العملات: SAR, USD, AED, EGP ثم باقي العملات أبجدياً.
    models.sort((a, b) {
      final aPriority =
          AppConstants.currencyPriority[a.currencyCode] ?? 999;
      final bPriority =
          AppConstants.currencyPriority[b.currencyCode] ?? 999;
      if (aPriority != bPriority) return aPriority - bPriority;
      return a.currencyCode.compareTo(b.currencyCode);
    });

    return models;
  }
}

/// مزوّد مصدر البيانات البعيد لأسعار الصرف.
final exchangeRatesRemoteDsProvider =
    Provider<ExchangeRatesRemoteDataSource>(
  (ref) => ExchangeRatesRemoteDataSource(ref.watch(dioClientProvider)),
);
