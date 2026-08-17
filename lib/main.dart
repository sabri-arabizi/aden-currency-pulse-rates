import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app.dart';
import 'core/storage/local_storage.dart';

/// نقطة دخول التطبيق: تهيئة التخزين المحلي وبيانات التنسيق ثم التشغيل.
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // تهيئة SharedPreferences (تعادل localStorage في تطبيق الويب).
  final prefs = await SharedPreferences.getInstance();

  // تهيئة بيانات تنسيق التواريخ العربية (ar-SA في تطبيق الويب).
  await initializeDateFormatting('ar');

  runApp(
    ProviderScope(
      overrides: [
        localStorageProvider.overrideWithValue(LocalStorage(prefs)),
      ],
      child: const AdenCurrencyApp(),
    ),
  );
}
