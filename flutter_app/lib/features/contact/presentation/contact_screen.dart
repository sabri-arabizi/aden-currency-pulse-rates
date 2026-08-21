import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/theme/app_colors.dart';

/// صفحة التواصل — تعادل Contact.tsx (عربية ثابتة كما في الأصل).
class ContactScreen extends StatelessWidget {
  const ContactScreen({super.key});

  Future<void> _launch(String url) async {
    final uri = Uri.parse(url);
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      // تجاهل الفشل بهدوء (لا يوجد تطبيق مناسب).
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration:
          const BoxDecoration(gradient: AppColors.backgroundGradient),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Column(
            children: [
              // الترويسة.
              Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(colors: [
                    Color(0xFF4F46E5),
                    Color(0xFF9333EA),
                    Color(0xFFDB2777),
                  ]),
                  boxShadow: [
                    BoxShadow(
                        color: Colors.black38,
                        blurRadius: 12,
                        offset: Offset(0, 4)),
                  ],
                ),
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    InkWell(
                      onTap: () =>
                          context.canPop() ? context.pop() : context.go('/'),
                      borderRadius: BorderRadius.circular(8),
                      child: const Padding(
                        padding: EdgeInsets.all(6),
                        child: Row(
                          children: [
                            Icon(Icons.arrow_forward,
                                color: Colors.white, size: 22),
                            SizedBox(width: 6),
                            Text('العودة للرئيسية',
                                style: TextStyle(color: Colors.white)),
                          ],
                        ),
                      ),
                    ),
                    const Spacer(),
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('التواصل معنا',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.bold)),
                        Text('للاستفسار والدعم الفني',
                            style: TextStyle(
                                color: Colors.white70, fontSize: 12)),
                      ],
                    ),
                    const SizedBox(width: 12),
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: AppColors.logoGradient,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      alignment: Alignment.center,
                      child: const Text('₹',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),

              // المحتوى.
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Center(
                    child: ConstrainedBox(
                      constraints:
                          const BoxConstraints(maxWidth: 720),
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.95),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: const [
                            BoxShadow(
                                color: Colors.black26,
                                blurRadius: 16,
                                offset: Offset(0, 6)),
                          ],
                        ),
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'معلومات التواصل',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1F2937)),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'نحن هنا لمساعدتك في أي استفسار',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                  fontSize: 15, color: Color(0xFF4B5563)),
                            ),
                            const SizedBox(height: 24),

                            // بطاقة الداعم الفني مع الشعار.
                            _section(
                              colors: const [
                                Color(0xFFFAF5FF),
                                Color(0xFFE0E7FF),
                              ],
                              border: const Color(0xFFD8B4FE),
                              child: Column(
                                children: [
                                  ClipRRect(
                                    borderRadius:
                                        BorderRadius.circular(16),
                                    child: Image.asset(
                                      'assets/images/shawahi_logo.png',
                                      width: 96,
                                      height: 96,
                                      fit: BoxFit.cover,
                                      errorBuilder:
                                          (context, error, stack) =>
                                              const SizedBox(
                                                  width: 96, height: 96),
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: Colors.white
                                          .withValues(alpha: 0.8),
                                      borderRadius:
                                          BorderRadius.circular(12),
                                      border: Border.all(
                                          color: const Color(0xFFD8B4FE)),
                                    ),
                                    child: const Column(
                                      children: [
                                        Text(
                                          'تم تصميم التطبيق من قبل الداعم الفني لشركة الشواحي للصرافة',
                                          textAlign: TextAlign.center,
                                          style: TextStyle(
                                              fontSize: 15,
                                              color: Color(0xFF374151)),
                                        ),
                                        SizedBox(height: 8),
                                        Text(
                                          'صبري الربيزي',
                                          style: TextStyle(
                                              fontSize: 19,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF9333EA)),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),

                            // بطاقة المطور.
                            _section(
                              colors: const [
                                Color(0xFFEFF6FF),
                                Color(0xFFE0E7FF),
                              ],
                              border: const Color(0xFFBFDBFE),
                              child: const Column(
                                children: [
                                  CircleAvatar(
                                    radius: 36,
                                    backgroundColor: Color(0xFF4F46E5),
                                    child: Text('ص',
                                        style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 26,
                                            fontWeight:
                                                FontWeight.bold)),
                                  ),
                                  SizedBox(height: 12),
                                  Text('صبري الربيزي',
                                      style: TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF1F2937))),
                                  SizedBox(height: 4),
                                  Text('مطور التطبيق والداعم الفني',
                                      style: TextStyle(
                                          fontSize: 15,
                                          color: Color(0xFF374151))),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),

                            // وسائل التواصل.
                            Row(
                              children: [
                                Expanded(
                                  child: _contactMethod(
                                    title: 'اتصال مباشر',
                                    value: '772055335',
                                    hint: 'انقر للاتصال المباشر',
                                    icon: Icons.phone,
                                    colors: const [
                                      Color(0xFF22C55E),
                                      Color(0xFF059669),
                                    ],
                                    onTap: () =>
                                        _launch('tel:772055335'),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: _contactMethod(
                                    title: 'واتساب',
                                    value: '772055335',
                                    hint: 'انقر للمراسلة عبر واتساب',
                                    icon: Icons.chat,
                                    colors: const [
                                      Color(0xFF16A34A),
                                      Color(0xFF15803D),
                                    ],
                                    onTap: () => _launch(
                                        'https://wa.me/967772055335'),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),

                            // أوقات التواصل.
                            _section(
                              colors: const [
                                Color(0xFFF9FAFB),
                                Color(0xFFF3F4F6),
                              ],
                              border: const Color(0xFFE5E7EB),
                              child: const Column(
                                children: [
                                  Text('أوقات التواصل',
                                      style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF1F2937))),
                                  SizedBox(height: 8),
                                  Text('متاح للتواصل من السبت إلى الخميس',
                                      style: TextStyle(
                                          color: Color(0xFF374151))),
                                  Text(
                                      'من الساعة 9:00 صباحاً إلى 6:00 مساءً',
                                      style: TextStyle(
                                          color: Color(0xFF374151))),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// قسم ملوّن بإطار.
  Widget _section({
    required List<Color> colors,
    required Color border,
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: colors),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: border),
      ),
      child: child,
    );
  }

  /// بطاقة وسيلة تواصل (هاتف/واتساب).
  Widget _contactMethod({
    required String title,
    required String value,
    required String hint,
    required IconData icon,
    required List<Color> colors,
    required VoidCallback onTap,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [
          Color(0xFFF0FDF4),
          Color(0xFFD1FAE5),
        ]),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFBBF7D0)),
      ),
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: colors),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white, size: 24),
          ),
          const SizedBox(height: 12),
          Text(title,
              style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1F2937))),
          const SizedBox(height: 8),
          InkWell(
            onTap: onTap,
            child: Text(
              value,
              textDirection: TextDirection.ltr,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF16A34A),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(hint,
              style: const TextStyle(
                  fontSize: 11, color: Color(0xFF4B5563))),
        ],
      ),
    );
  }
}
