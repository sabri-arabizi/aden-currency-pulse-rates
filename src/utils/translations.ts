
export const translations = {
  ar: {
    // Header
    appTitle: 'اسعار الصرف اليمن',
    liveUpdate: 'تحديث مباشر ولحظي',
    
    // Cities
    selectCity: 'اختر المدينة',
    sanaa: 'صنعاء',
    aden: 'عدن',
    
    // Tabs
    currencies: 'العملات الأجنبية',
    gold: 'أسعار الذهب',
    converter: 'التحويل',
    
    // Exchange Rates
    exchangeRates: 'أسعار الصرف',
    goldPrices: 'أسعار الذهب',
    currencyConverter: 'محول العملات',
    
    // Actions
    buy: 'شراء',
    sell: 'بيع',
    lastUpdate: 'آخر تحديث',
    manualUpdate: 'تحديث يدوي',
    
    // Navigation
    contact: 'التواصل معنا',
    home: 'الرئيسية',
    
    // Contact
    contactInfo: 'معلومات التواصل',
    directCall: 'اتصال مباشر',
    whatsapp: 'واتساب',
    workingHours: 'أوقات التواصل',
    
    // Sources
    sources: 'المصادر',
    accurateConversion: 'تحويل دقيق للعملات بناءً على الأسعار المباشرة',
    
    // Update buttons
    updateSar: 'تحديث SAR',
    updateGold: 'تحديث الذهب',
    updating: 'جاري التحديث...',
    
    // Error messages
    errorLoading: 'خطأ في تحميل البيانات',
    tryAgain: 'يرجى المحاولة مرة أخرى'
  },
  en: {
    // Header
    appTitle: 'Yemen Exchange Rates',
    liveUpdate: 'Live & Real-time Updates',
    
    // Cities
    selectCity: 'Select City',
    sanaa: 'Sanaa',
    aden: 'Aden',
    
    // Tabs
    currencies: 'Foreign Currencies',
    gold: 'Gold Prices',
    converter: 'Converter',
    
    // Exchange Rates
    exchangeRates: 'Exchange Rates',
    goldPrices: 'Gold Prices',
    currencyConverter: 'Currency Converter',
    
    // Actions
    buy: 'Buy',
    sell: 'Sell',
    lastUpdate: 'Last Update',
    manualUpdate: 'Manual Update',
    
    // Navigation
    contact: 'Contact Us',
    home: 'Home',
    
    // Contact
    contactInfo: 'Contact Information',
    directCall: 'Direct Call',
    whatsapp: 'WhatsApp',
    workingHours: 'Working Hours',
    
    // Sources
    sources: 'Sources',
    accurateConversion: 'Accurate currency conversion based on live rates',
    
    // Update buttons
    updateSar: 'Update SAR',
    updateGold: 'Update Gold',
    updating: 'Updating...',
    
    // Error messages
    errorLoading: 'Error loading data',
    tryAgain: 'Please try again'
  }
};

export const t = (key: string, language: 'ar' | 'en') => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};
