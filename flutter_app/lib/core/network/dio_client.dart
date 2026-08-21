import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api_interceptor.dart';

/// عميل HTTP موحّد للتطبيق مبني على Dio.
///
/// يُستخدم لقراءة جداول Supabase عبر PostgREST ولاستدعاء Edge Functions.
class DioClient {
  DioClient({Dio? dio})
      : _dio = dio ??
            Dio(BaseOptions(
              connectTimeout: const Duration(seconds: 20),
              receiveTimeout: const Duration(seconds: 30),
              sendTimeout: const Duration(seconds: 20),
              responseType: ResponseType.json,
            )) {
    _dio.interceptors.add(const ApiInterceptor());
    if (kDebugMode) {
      _dio.interceptors.add(const DebugLogInterceptor());
    }
  }

  final Dio _dio;

  /// طلب GET وإرجاع جسم الاستجابة.
  ///
  /// يرمي [ApiException] عند أي فشل (التحويل يتم في الاعتراض).
  Future<dynamic> get(String url,
      {Map<String, dynamic>? queryParameters}) async {
    try {
      final response =
          await _dio.get<dynamic>(url, queryParameters: queryParameters);
      return response.data;
    } on DioException catch (e) {
      throw e.error is Exception ? e.error as Exception : mapDioException(e);
    }
  }

  /// طلب POST وإرجاع جسم الاستجابة.
  Future<dynamic> post(String url, {dynamic data}) async {
    try {
      final response = await _dio.post<dynamic>(url, data: data);
      return response.data;
    } on DioException catch (e) {
      throw e.error is Exception ? e.error as Exception : mapDioException(e);
    }
  }
}

/// مزوّد Riverpod لعميل Dio الوحيد في التطبيق.
final dioClientProvider = Provider<DioClient>((ref) => DioClient());
