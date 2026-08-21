import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/local_storage.dart';

/// لغات التطبيق المدعومة.
enum Language {
  ar('ar', TextDirectionValue.rtl),
  en('en', TextDirectionValue.ltr);

  const Language(this.code, this.direction);

  /// رمز اللغة المخزّن ('ar' / 'en').
  final String code;

  /// اتجاه النص المرتبط باللغة.
  final TextDirectionValue direction;

  static Language fromCode(String code) =>
      code == 'en' ? Language.en : Language.ar;
}

/// اتجاه النص (RTL للعربية، LTR للإنجليزية).
enum TextDirectionValue { rtl, ltr }

/// متحكم اللغة: يقرأ اللغة المحفوظة عند الإقلاع ويحفظ أي تغيير.
class LanguageController extends Notifier<Language> {
  @override
  Language build() {
    final storage = ref.watch(localStorageProvider);
    return Language.fromCode(storage.getLanguage());
  }

  /// تغيير اللغة وحفظها في التخزين المحلي.
  Future<void> setLanguage(Language language) async {
    state = language;
    await ref.read(localStorageProvider).setLanguage(language.code);
  }
}

/// مزوّد اللغة الحالية للتطبيق.
final languageProvider =
    NotifierProvider<LanguageController, Language>(LanguageController.new);
