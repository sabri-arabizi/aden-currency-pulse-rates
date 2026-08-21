import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../constants/api_constants.dart';
import 'api_exception.dart';

/// معترض Dio يحقن ترويسات Supabase (apikey + Authorization) في كل طلب
/// ويسجّل الطلبات في وضع التصحيح ويحوّل DioException إلى ApiException.
class ApiInterceptor extends Interceptor {
  const ApiInterceptor();

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    options.headers['apikey'] = ApiConstants.supabaseAnonKey;
    options.headers['Authorization'] =
        'Bearer ${ApiConstants.supabaseAnonKey}';
    if (!options.headers.containsKey('Content-Type')) {
      options.headers['Content-Type'] = 'application/json';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    handler.next(err.copyWith(error: mapDioException(err)));
  }
}

/// تحويل DioException إلى ApiException برسالة واضحة.
ApiException mapDioException(DioException err) {
  final response = err.response;
  if (response != null) {
    final data = response.data;
    String message = 'HTTP ${response.statusCode}';
    if (data is Map<String, dynamic>) {
      message = (data['message'] ?? data['msg'] ?? data['hint'] ?? message)
          .toString();
    } else if (data is String && data.isNotEmpty) {
      message = data;
    }
    return ApiException(message,
        statusCode: response.statusCode, data: data);
  }
  switch (err.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.sendTimeout:
    case DioExceptionType.receiveTimeout:
      return const ApiException('انتهت مهلة الاتصال بالخادم');
    case DioExceptionType.connectionError:
      return const ApiException('تعذّر الاتصال بالخادم، تحقق من الإنترنت');
    default:
      return ApiException(err.message ?? 'خطأ غير متوقع في الشبكة');
  }
}

/// اعتراض تسجيل بسيط في وضع التصحيح فقط.
class DebugLogInterceptor extends Interceptor {
  const DebugLogInterceptor();

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    debugPrint('[DIO] ${options.method} ${options.uri}');
    handler.next(options);
  }

  @override
  void onResponse(
      Response response, ResponseInterceptorHandler handler) {
    debugPrint(
        '[DIO] ${response.statusCode} ${response.requestOptions.uri}');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    debugPrint('[DIO][ERROR] ${err.requestOptions.uri}: ${err.message}');
    handler.next(err);
  }
}
