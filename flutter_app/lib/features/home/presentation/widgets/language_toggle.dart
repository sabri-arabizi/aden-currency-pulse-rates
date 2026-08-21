import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/l10n/language_controller.dart';

/// زر تبديل اللغة (عربي/English) — يعادل LanguageToggle.tsx.
class LanguageToggle extends ConsumerWidget {
  const LanguageToggle({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.25),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: 0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _option(context, ref, Language.ar, 'عربي', language),
          _option(context, ref, Language.en, 'EN', language),
        ],
      ),
    );
  }

  Widget _option(BuildContext context, WidgetRef ref, Language value,
      String label, Language current) {
    final selected = value == current;
    return GestureDetector(
      onTap: () => ref.read(languageProvider.notifier).setLanguage(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: selected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: selected ? const Color(0xFF92400E) : Colors.white,
          ),
        ),
      ),
    );
  }
}
