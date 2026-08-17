import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/manual_refresh_controller.dart';

/// زر التحديث اليدوي — يعادل ManualRefreshButton.tsx:
/// إعلان بمكافأة ثم استدعاء دوال التحديث الست ثم إعادة الجلب.
class ManualRefreshButton extends ConsumerWidget {
  const ManualRefreshButton({super.key});

  Future<void> _onPressed(BuildContext context, WidgetRef ref) async {
    final summary =
        await ref.read(manualRefreshProvider.notifier).refresh();
    if (!context.mounted) return;

    final messenger = ScaffoldMessenger.of(context);
    if (summary.unexpectedError != null) {
      messenger.showSnackBar(const SnackBar(
        backgroundColor: Color(0xFF991B1B),
        content: Text(
          '❌ خطأ في التحديث — حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
          textDirection: TextDirection.rtl,
        ),
        duration: Duration(seconds: 5),
      ));
    } else if (summary.failCount == 0) {
      messenger.showSnackBar(SnackBar(
        backgroundColor: const Color(0xFF166534),
        content: Text(
          '✅ تم التحديث بنجاح — تم تحديث ${summary.successCount} من الأسعار بأحدث البيانات.',
          textDirection: TextDirection.rtl,
        ),
        duration: const Duration(seconds: 3),
      ));
    } else {
      messenger.showSnackBar(SnackBar(
        backgroundColor: const Color(0xFFB45309),
        content: Text(
          '⚠️ تحديث جزئي — نجح: ${summary.successCount} | فشل: ${summary.failCount}',
          textDirection: TextDirection.rtl,
        ),
        duration: const Duration(seconds: 5),
      ));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isRefreshing = ref.watch(manualRefreshProvider);

    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
            colors: [Color(0xFF3B82F6), Color(0xFF2563EB)]),
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [
          BoxShadow(
              color: Colors.black26, blurRadius: 8, offset: Offset(0, 3)),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: isRefreshing ? null : () => _onPressed(context, ref),
          child: Padding(
            padding:
                const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (isRefreshing)
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white),
                  )
                else
                  const Icon(Icons.refresh, size: 20, color: Colors.white),
                const SizedBox(width: 8),
                // النص عربي ثابت كما في تطبيق الويب.
                Text(
                  isRefreshing
                      ? 'جاري التحديث...'
                      : 'تحديث يدوي (الجدولة متوقفة)',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
