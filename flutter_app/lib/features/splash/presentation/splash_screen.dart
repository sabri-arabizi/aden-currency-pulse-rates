import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// شاشة البداية (Splash): تعرض صورة الشاشة `assets/images/splash.jfif`
/// بملء الشاشة كما هي (دون تغيير ألوانها) مع حلقة تحميل دوّارة متحركة
/// (دائرة بسهم) عند الأسفل، لمدة 3 ثوانٍ ثم الانتقال للرئيسية.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  /// مدة عرض شاشة البداية قبل الانتقال للرئيسية (3 ثوانٍ).
  static const Duration duration = Duration(seconds: 3);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _spin;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _spin = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat();
    _timer = Timer(SplashScreen.duration, () {
      if (mounted) {
        context.go('/');
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _spin.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // صورة الشاشة كما هي دون تغيير الألوان.
          Image.asset('assets/images/splash.jfif', fit: BoxFit.cover),
          // حلقة تحميل دوّارة (دائرة بسهم) عند الزاوية السفلية.
          Align(
            alignment: Alignment.bottomRight,
            child: SafeArea(
              minimum: const EdgeInsets.only(bottom: 28, right: 28),
              child: SizedBox(
                width: 56,
                height: 56,
                child: RotationTransition(
                  turns: _spin,
                  child: const CustomPaint(
                    painter: _LoadingRingPainter(),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// حلقة تحميل ذهبية دوّارة برأس سهم عند طرفها — حركة دائرة وسهم معاً.
class _LoadingRingPainter extends CustomPainter {
  const _LoadingRingPainter();

  static const _trackColor = Color(0x2E92400E);
  static const _goldColors = [
    Color(0xFFF59E0B),
    Color(0xFFD97706),
    Color(0xFFB45309),
  ];

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final stroke = size.shortestSide * 0.12;
    final radius = size.shortestSide / 2 - stroke;

    // مسار الحلقة (خفيف).
    canvas.drawCircle(
      center,
      radius,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = stroke
        ..color = _trackColor,
    );

    // قوس ذهبي متدرّج (حوالي 300°).
    const sweep = math.pi * 1.66;
    final rect = Rect.fromCircle(center: center, radius: radius);
    final arcPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round
      ..shader = const LinearGradient(colors: _goldColors).createShader(rect);
    canvas.drawArc(rect, -math.pi / 2, sweep, false, arcPaint);

    // رأس السهم عند نهاية القوس.
    final tipAngle = -math.pi / 2 + sweep;
    final tip = Offset(
      center.dx + math.cos(tipAngle) * radius,
      center.dy + math.sin(tipAngle) * radius,
    );
    final arrow = Path()
      ..moveTo(tip.dx, tip.dy)
      ..lineTo(
        tip.dx - stroke * 1.6,
        tip.dy - stroke * 1.6,
      )
      ..lineTo(
        tip.dx + stroke * 0.6,
        tip.dy - stroke * 2.1,
      )
      ..close();
    canvas.drawPath(arrow, Paint()..color = const Color(0xFFD97706));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
