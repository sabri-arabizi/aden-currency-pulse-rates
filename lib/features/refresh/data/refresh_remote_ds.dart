import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/dio_client.dart';

/// نتيجة استدعاء دالة تحديث واحدة.
class UpdateResult {
  const UpdateResult({required this.name, required this.success, this.error});

  /// اسم العملية للعرض (SAR، ذهب عدن...).
  final String name;

  /// هل نجحت؟
  final bool success;

  /// رسالة الخطأ عند الفشل.
  final String? error;
}

/// مصدر بيانات التحديث اليدوي: استدعاء Edge Functions عبر Dio
/// (مطابق لـ supabase.functions.invoke في تطبيق الويب).
class RefreshRemoteDataSource {
  const RefreshRemoteDataSource(this._client);

  final DioClient _client;

  /// استدعاء دالة تحديث عملات (النجاح = عدم وجود خطأ).
  Future<UpdateResult> invokeCurrencyFunction(String functionName, String displayName) async {
    try {
      await _client.post(
        '${ApiConstants.functionsBaseUrl}/$functionName',
        data: {'manual': true},
      );
      return UpdateResult(name: displayName, success: true);
    } on Exception catch (e) {
      return UpdateResult(name: displayName, success: false, error: e.toString());
    }
  }

  /// استدعاء دالة تحديث ذهب (النجاح = عدم وجود خطأ + success في الاستجابة).
  Future<UpdateResult> invokeGoldFunction(String functionName, String displayName) async {
    try {
      final data = await _client.post(
        '${ApiConstants.functionsBaseUrl}/$functionName',
        data: {
          'manual': true,
          'timestamp': DateTime.now().millisecondsSinceEpoch,
        },
      );
      final success =
          data is Map<String, dynamic> && data['success'] == true;
      return UpdateResult(name: displayName, success: success);
    } on Exception catch (e) {
      return UpdateResult(name: displayName, success: false, error: e.toString());
    }
  }
}

/// مزوّد مصدر بيانات التحديث اليدوي.
final refreshRemoteDsProvider = Provider<RefreshRemoteDataSource>(
  (ref) => RefreshRemoteDataSource(ref.watch(dioClientProvider)),
);
