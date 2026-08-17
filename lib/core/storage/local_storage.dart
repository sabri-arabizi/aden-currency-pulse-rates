import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../constants/app_constants.dart';

/// خدمة تخزين محلي بسيطة فوق SharedPreferences
/// (تعادل localStorage في تطبيق الويب).
class LocalStorage {
  const LocalStorage(this._prefs);

  final SharedPreferences _prefs;

  // ---- اللغة ----

  /// قراءة اللغة المحفوظة ('ar' أو 'en')، الافتراضي 'ar'.
  String getLanguage() =>
      _prefs.getString(AppConstants.languageKey) ?? 'ar';

  /// حفظ اللغة المختارة.
  Future<void> setLanguage(String language) =>
      _prefs.setString(AppConstants.languageKey, language);

  // ---- أوقات تحديث الذهب ----

  String _goldKey(String city) =>
      '${AppConstants.goldLastUpdateKeyPrefix}_$city';

  /// تسجيل وقت آخر تحديث ناجح لأسعار الذهب لمدينة معيّنة (مللي ثانية).
  Future<void> setGoldLastUpdate(String city, int timestampMillis) =>
      _prefs.setString(_goldKey(city), timestampMillis.toString());

  /// قراءة وقت آخر تحديث ناجح للذهب (0 إن لم يوجد).
  int getGoldLastUpdate(String city) {
    final stored = _prefs.getString(_goldKey(city));
    return stored != null ? int.tryParse(stored) ?? 0 : 0;
  }

  /// مسح وقت التحديث المخزّن لمدينة.
  Future<void> clearGoldLastUpdate(String city) => _prefs.remove(_goldKey(city));
}

/// مزوّد خدمة التخزين — يجب تجاوزه (override) في main بعد التهيئة.
final localStorageProvider = Provider<LocalStorage>((ref) {
  throw UnimplementedError(
      'localStorageProvider must be overridden with an initialized instance');
});
