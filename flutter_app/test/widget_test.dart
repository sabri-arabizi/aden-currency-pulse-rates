import 'package:aden_currency_flutter/app.dart';
import 'package:aden_currency_flutter/core/storage/local_storage.dart';
import 'package:aden_currency_flutter/features/exchange_rates/data/repositories/exchange_rates_repository_impl.dart';
import 'package:aden_currency_flutter/features/exchange_rates/domain/entities/exchange_rate.dart';
import 'package:aden_currency_flutter/features/exchange_rates/domain/repositories/exchange_rates_repository.dart';
import 'package:aden_currency_flutter/features/gold_prices/data/repositories/gold_prices_repository_impl.dart';
import 'package:aden_currency_flutter/features/gold_prices/domain/entities/gold_price.dart';
import 'package:aden_currency_flutter/features/gold_prices/domain/repositories/gold_prices_repository.dart';
import 'package:aden_currency_flutter/features/home/presentation/providers/city_slides_provider.dart';
import 'package:aden_currency_flutter/features/splash/presentation/splash_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// مستودع أسعار وهمي (بدون شبكة).
class FakeExchangeRatesRepository implements ExchangeRatesRepository {
  @override
  Future<List<ExchangeRate>> getRates(String city) async => [
        ExchangeRate(
          id: '1',
          currencyCode: 'SAR',
          currencyName: 'ريال سعودي',
          buyPrice: 140,
          sellPrice: 141,
          flagUrl: '',
          city: city,
          updatedAt: DateTime.now(),
        ),
        ExchangeRate(
          id: '2',
          currencyCode: 'USD',
          currencyName: 'دولار أمريكي',
          buyPrice: 530,
          sellPrice: 535,
          flagUrl: '',
          city: city,
          updatedAt: DateTime.now(),
        ),
      ];
}

/// مستودع ذهب وهمي (بدون شبكة).
class FakeGoldPricesRepository implements GoldPricesRepository {
  @override
  Future<List<GoldPrice>> getGoldPrices(String city) async => [
        GoldPrice(
          id: '1',
          type: 'عيار 21',
          buyPrice: 98500,
          sellPrice: 99500,
          city: city,
          updatedAt: DateTime.now(),
          isStale: false,
        ),
      ];
}

void main() {
  setUpAll(() async {
    await initializeDateFormatting('ar');
  });

  testWidgets('الشاشة الرئيسية تعرض العنوان والمدن والتبويبات والأسعار',
      (tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          localStorageProvider.overrideWithValue(LocalStorage(prefs)),
          // صور المدن: قيم افتراضية محلية (بلا شبكة في الاختبار).
          citySlidesProvider.overrideWith((ref) => defaultCitySlides),
          exchangeRatesRepositoryProvider
              .overrideWithValue(FakeExchangeRatesRepository()),
          goldPricesRepositoryProvider
              .overrideWithValue(FakeGoldPricesRepository()),
        ],
        child: const AdenCurrencyApp(),
      ),
    );
    // لا نستخدم pumpAndSettle هنا لأن سلايدر المدن يعمل تلقائياً (مؤقّت دوري)،
    // فنعتمد pumps بمدد ثابتة ثم نتخلص من الشجرة في النهاية لإلغاء المؤقّت.
    await tester.pump();

    // شاشة البداية (Splash) تظهر أولاً لمدة 3 ثوانٍ وتعرض صورة الشاشة
    // مع حلقة التحميل الدوّارة.
    expect(find.byType(Image), findsOneWidget);
    expect(find.byType(RotationTransition), findsWidgets);

    // تجاوز مدة الـ Splash (3 ثوانٍ) ثم الانتقال للرئيسية.
    await tester.pump(SplashScreen.duration);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    // العنوان والمدن والتبويبات.
    expect(find.text('صنعاء'), findsAtLeastNWidgets(1));
    expect(find.text('عدن'), findsWidgets);
    expect(find.text('العملات الأجنبية'), findsOneWidget);
    expect(find.text('أسعار الذهب'), findsOneWidget);
    expect(find.text('التحويل'), findsOneWidget);

    // بطاقات الأسعار من المستودع الوهمي.
    expect(find.text('ريال سعودي'), findsOneWidget);
    expect(find.text('دولار أمريكي'), findsOneWidget);
    expect(find.text('140'), findsOneWidget);

    // التخلص من الشجرة لإلغاء مؤقّت إعادة الجلب الدوري.
    await tester.pumpWidget(const SizedBox());
  });
}
