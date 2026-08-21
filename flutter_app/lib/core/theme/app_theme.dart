import 'package:flutter/material.dart';

import 'app_colors.dart';

/// سمة التطبيق (Material 3) بهوية كهرمانية/بنية داكنة.
class AppTheme {
  AppTheme._();

  /// بناء ThemeData الرئيسي.
  static ThemeData get theme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.gold,
      brightness: Brightness.dark,
      primary: AppColors.gold,
      secondary: AppColors.accentYellow,
      surface: const Color(0xFF5B3A1E),
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: Colors.transparent,
      snackBarTheme: const SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
