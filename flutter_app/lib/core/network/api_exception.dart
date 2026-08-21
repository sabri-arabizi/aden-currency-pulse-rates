/// استثناء موحّد لأخطاء الشبكة/الخادم بعد تحويل DioException.
library;

class ApiException implements Exception {
  /// إنشاء استثناء API برسالة ورمز حالة اختياري.
  const ApiException(this.message, {this.statusCode, this.data});

  /// رسالة الخطأ المقروءة.
  final String message;

  /// رمز حالة HTTP إن وُجد.
  final int? statusCode;

  /// جسم الاستجابة الخام إن وُجد.
  final dynamic data;

  @override
  String toString() =>
      'ApiException(statusCode: $statusCode, message: $message)';
}
