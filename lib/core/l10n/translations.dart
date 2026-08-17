/// الترجمات الكاملة (عربي/إنجليزي) منقولة حرفياً من src/utils/translations.ts.
library;

import '../l10n/language_controller.dart';

/// خريطة الترجمات: لكل لغة قاموس (مفتاح → نص).
const Map<String, Map<String, String>> translations = {
  'ar': {
    // Header
    'appTitle': 'اسعار الصرف اليمن',
    'liveUpdate': 'تحديث مباشر ولحظي',

    // Cities
    'selectCity': 'اختر المدينة',
    'sanaa': 'صنعاء',
    'aden': 'عدن',
    'taiz': 'تعز',
    'hodeidah': 'الحديدة',
    'ibb': 'إب',
    'mukalla': 'المكلا',
    'yemenCities': 'أبرز المدن اليمنية',
    'yemenTagline': 'من صنعاء التاريخ إلى سواحل عدن',

    // Tabs
    'currencies': 'العملات الأجنبية',
    'gold': 'أسعار الذهب',
    'converter': 'التحويل',

    // Exchange Rates
    'exchangeRates': 'أسعار الصرف',
    'goldPrices': 'أسعار الذهب',
    'currencyConverter': 'محول العملات',

    // Actions
    'buy': 'شراء',
    'sell': 'بيع',
    'lastUpdate': 'آخر تحديث',
    'manualUpdate': 'تحديث يدوي',

    // Navigation
    'contact': 'التواصل معنا',
    'home': 'الرئيسية',

    // Contact
    'contactInfo': 'معلومات التواصل',
    'directCall': 'اتصال مباشر',
    'whatsapp': 'واتساب',
    'workingHours': 'أوقات التواصل',

    // Sources
    'sources': 'المصادر',
    'accurateConversion': 'تحويل دقيق للعملات بناءً على الأسعار المباشرة',

    // Update buttons
    'updateSar': 'تحديث SAR',
    'updateGold': 'تحديث الذهب',
    'updating': 'جاري التحديث...',

    // Error messages
    'errorLoading': 'خطأ في تحميل البيانات',
    'tryAgain': 'يرجى المحاولة مرة أخرى',
  },
  'en': {
    // Header
    'appTitle': 'Yemen Exchange Rates',
    'liveUpdate': 'Live & Real-time Updates',

    // Cities
    'selectCity': 'Select City',
    'sanaa': 'Sanaa',
    'aden': 'Aden',
    'taiz': 'Taiz',
    'hodeidah': 'Hodeidah',
    'ibb': 'Ibb',
    'mukalla': 'Mukalla',
    'yemenCities': 'Major Yemeni Cities',
    'yemenTagline': 'From historic Sanaa to the shores of Aden',

    // Tabs
    'currencies': 'Foreign Currencies',
    'gold': 'Gold Prices',
    'converter': 'Converter',

    // Exchange Rates
    'exchangeRates': 'Exchange Rates',
    'goldPrices': 'Gold Prices',
    'currencyConverter': 'Currency Converter',

    // Actions
    'buy': 'Buy',
    'sell': 'Sell',
    'lastUpdate': 'Last Update',
    'manualUpdate': 'Manual Update',

    // Navigation
    'contact': 'Contact Us',
    'home': 'Home',

    // Contact
    'contactInfo': 'Contact Information',
    'directCall': 'Direct Call',
    'whatsapp': 'WhatsApp',
    'workingHours': 'Working Hours',

    // Sources
    'sources': 'Sources',
    'accurateConversion': 'Accurate currency conversion based on live rates',

    // Update buttons
    'updateSar': 'Update SAR',
    'updateGold': 'Update Gold',
    'updating': 'Updating...',

    // Error messages
    'errorLoading': 'Error loading data',
    'tryAgain': 'Please try again',
  },
};

/// ترجمة مفتاح للغة معيّنة؛ تُرجع المفتاح نفسه إن لم يوجد.
String translate(String key, Language language) {
  return translations[language.code]?[key] ?? key;
}

/// اختصار ثنائي اللغة للنصوص المضمّنة في مكونات React الأصلية
/// (كثير من النصوص في المكونات كانت ternary مباشرة وليست مفاتيح ترجمة).
String pick(Language language, String ar, String en) =>
    language == Language.ar ? ar : en;

/// اسم المدينة للعرض حسب اللغة (getCityName في Index.tsx):
/// تبقى عربية في العربية، وتُترجم في الإنجليزية.
String cityDisplayName(String city, Language language) {
  if (language == Language.en) {
    return city == 'صنعاء' ? 'Sanaa' : 'Aden';
  }
  return city;
}
