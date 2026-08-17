import 'dart:async';
import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:unity_ads_plugin/unity_ads_plugin.dart';

import '../constants/app_constants.dart';

/// واجهة خدمة الإعلانات — تخفي تفاصيل Unity Ads عن بقية التطبيق.
///
/// كل العمليات NO-OP آمنة: أي فشل في التهيئة/التحميل/العرض يُسجَّل فقط
/// ولا يُعطّل التطبيق أو يمنع التحديث اليدوي (سياسة "تخطَّ عند الخطأ").
abstract class AdsService {
  /// تهيئة كسولة — تُستدعى تلقائياً قبل أول عرض.
  Future<void> init();

  /// إظهار إعلان بانر (يُستدعى عند اختيار مدينة).
  Future<void> showBanner();

  /// إظهار إعلان بيني (يُستدعى عند فتح تبويب الذهب).
  Future<void> showInterstitial();

  /// إظهار إعلان بمكافأة (يُستدعى قبل التحديث اليدوي).
  Future<void> showRewarded();

  /// ودجت البانر لعرضه أسفل الشاشة (null على المنصات غير المدعومة).
  Widget? bannerAdWidget();
}

/// تنفيذ لا-يفعل-شيء (للمنصات غير المدعومة أو كاحتياط).
class NoopAdsService implements AdsService {
  const NoopAdsService();

  void _log(String op) => debugPrint('[ADS] no-op: $op');

  @override
  Future<void> init() async => _log('init');

  @override
  Future<void> showBanner() async => _log('showBanner');

  @override
  Future<void> showInterstitial() async => _log('showInterstitial');

  @override
  Future<void> showRewarded() async => _log('showRewarded');

  @override
  Widget? bannerAdWidget() => null;
}

/// تنفيذ Unity Ads الفعلي (Android/iOS فقط، مع تخطٍّ آمن عند أي خطأ).
class UnityAdsService implements AdsService {
  bool _initialized = false;
  Completer<bool>? _initCompleter;

  bool get _isSupported =>
      !kIsWeb && (Platform.isAndroid || Platform.isIOS);

  @override
  Future<void> init() async {
    if (!_isSupported || _initialized) return;
    if (_initCompleter != null) {
      await _initCompleter!.future;
      return;
    }
    final completer = Completer<bool>();
    _initCompleter = completer;
    try {
      await UnityAds.init(
        gameId: AppConstants.unityGameId,
        testMode: AppConstants.unityTestMode,
        onComplete: () {
          _initialized = true;
          if (!completer.isCompleted) completer.complete(true);
        },
        onFailed: (error, message) {
          debugPrint('[ADS] init failed: $error $message');
          if (!completer.isCompleted) completer.complete(false);
        },
      );
      // انتظار قصير كحد أقصى حتى لا يتعطل التطبيق إن لم يصل رد.
      await completer.future
          .timeout(const Duration(seconds: 10), onTimeout: () => false);
    } catch (e) {
      debugPrint('[ADS] init error: $e');
    } finally {
      _initCompleter = null;
    }
  }

  /// تحميل إعلان ثم عرضه عند توفره؛ أي فشل يُسجَّل ويُتخطّى.
  Future<void> _loadAndShow(String placementId) async {
    if (!_isSupported) return;
    try {
      await init();
      if (!_initialized) return;
      final completer = Completer<bool>();
      await UnityAds.load(
        placementId: placementId,
        onComplete: (id) {
          if (!completer.isCompleted) completer.complete(true);
        },
        onFailed: (id, error, message) {
          debugPrint('[ADS] load failed ($id): $error $message');
          if (!completer.isCompleted) completer.complete(false);
        },
      );
      final ok = await completer.future
          .timeout(const Duration(seconds: 15), onTimeout: () => false);
      if (ok) await _show(placementId);
    } catch (e) {
      debugPrint('[ADS] loadAndShow error ($placementId): $e');
    }
  }

  Future<void> _show(String placementId) async {
    try {
      await UnityAds.showVideoAd(
        placementId: placementId,
        onFailed: (id, error, message) =>
            debugPrint('[ADS] show failed ($id): $error $message'),
        onSkipped: (id) => _preload(placementId),
        onComplete: (id) => _preload(placementId),
      );
    } catch (e) {
      debugPrint('[ADS] show error ($placementId): $e');
    }
  }

  /// إعادة تحميل الإعلان بعد عرضه تمهيداً للمرة التالية.
  void _preload(String placementId) {
    try {
      UnityAds.load(placementId: placementId);
    } catch (e) {
      debugPrint('[ADS] preload error: $e');
    }
  }

  @override
  Future<void> showBanner() async {
    // البانر يُعرض كودجت دائم أسفل الشاشة؛ هنا نكتفي بالتهيئة.
    await init();
  }

  @override
  Future<void> showInterstitial() =>
      _loadAndShow(AppConstants.unityInterstitialPlacement);

  @override
  Future<void> showRewarded() =>
      _loadAndShow(AppConstants.unityRewardedPlacement);

  @override
  Widget? bannerAdWidget() {
    if (!_isSupported) return null;
    return UnityBannerAd(
      placementId: AppConstants.unityBannerPlacement,
      onFailed: (id, error, message) =>
          debugPrint('[ADS] banner failed ($id): $error $message'),
    );
  }
}

/// مزوّد خدمة الإعلانات.
final adsServiceProvider = Provider<AdsService>((ref) => UnityAdsService());
