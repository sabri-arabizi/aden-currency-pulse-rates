import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/l10n/language_controller.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

/// ودجت الجذر للتطبيق: الثيم، اللغة/الاتجاه (RTL افتراضياً)، والتوجيه.
class AdenCurrencyApp extends ConsumerWidget {
  const AdenCurrencyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    final isArabic = language == Language.ar;

    return MaterialApp.router(
      title: 'اسعار الصرف اليمن',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      routerConfig: appRouter,
      locale: Locale(language.code),
      supportedLocales: const [Locale('ar'), Locale('en')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      // فرض الاتجاه حسب اللغة (مطابق لـ document.dir في تطبيق الويب).
      builder: (context, child) => Directionality(
        textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
        child: child ?? const SizedBox.shrink(),
      ),
    );
  }
}
