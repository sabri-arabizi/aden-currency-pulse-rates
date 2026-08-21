import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/contact/presentation/contact_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/splash/presentation/splash_screen.dart';

/// موجّه التطبيق: شاشة البداية ثم الرئيسية، مع صفحة 404 احتياطية.
final appRouter = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      name: 'splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/',
      name: 'home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/contact',
      name: 'contact',
      builder: (context, state) => const ContactScreen(),
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    backgroundColor: const Color(0xFF78350F),
    body: Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('404',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 48,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(
            'الصفحة غير موجودة — ${state.uri.path}',
            style: const TextStyle(color: Colors.white70),
            textDirection: TextDirection.rtl,
          ),
          const SizedBox(height: 16),
          TextButton(
            onPressed: () => context.go('/'),
            child: const Text('العودة للرئيسية',
                style: TextStyle(color: Color(0xFFFACC15))),
          ),
        ],
      ),
    ),
  ),
);
