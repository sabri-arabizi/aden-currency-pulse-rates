# اسعار الصرف اليمن - Yemen Currency Exchange Rates

## وصف التطبيق
تطبيق لعرض أسعار صرف العملات في اليمن (عدن وصنعاء) مع أسعار الذهب المحدثة لحظياً.

## المميزات
- 📱 تطبيق محمول مع إعلانات AdMob
- 🏙️ عرض أسعار عدن وصنعاء
- 💰 أسعار الذهب المحدثة
- 🔄 تحديث يدوي وتلقائي للأسعار
- 🌐 دعم اللغتين العربية والإنجليزية
- 📊 محول العملات

## تقنيات المستخدمة
- React + TypeScript + Vite
- Tailwind CSS للتصميم
- Capacitor للتطبيق المحمول
- Supabase للخلفية وقاعدة البيانات
- AdMob للإعلانات

## إعداد التطبيق المحمول

### متطلبات التطوير
- Node.js 18+
- Android Studio (للأندرويد)
- Xcode (للآيفون - Mac فقط)

### خطوات إنشاء APK

1. **نقل المشروع إلى GitHub:**
   - اضغط على زر "Export to GitHub" في Lovable
   - انسخ المشروع من GitHub الخاص بك

2. **تثبيت المتطلبات:**
   ```bash
   npm install
   ```

3. **إضافة منصة Android:**
   ```bash
   npx cap add android
   ```

4. **تحديث المنصة:**
   ```bash
   npx cap update android
   ```

5. **بناء التطبيق:**
   ```bash
   npm run build
   ```

6. **مزامنة مع Capacitor:**
   ```bash
   npx cap sync
   ```

7. **فتح مشروع Android:**
   ```bash
   npx cap open android
   ```

8. **بناء APK من Android Studio:**
   - Build > Build Bundle(s) / APK(s) > Build APK(s)
   - أو استخدم الأمر: `./gradlew assembleRelease`

### ملفات الخلفية المتضمنة

التطبيق يحتوي على ملفات خلفية Supabase Edge Functions:

#### 🔄 وظائف تحديث الأسعار
- `update-sar-prices/` - تحديث أسعار الريال السعودي
- `update-aed-prices/` - تحديث أسعار الدرهم الإماراتي  
- `update-egp-prices/` - تحديث أسعار الجنيه المصري
- `update-gold-prices/` - تحديث أسعار الذهب
- `update-sanaa-rates-from-khbr/` - تحديث أسعار صنعاء
- `update-aden-gold-from-souta/` - تحديث أسعار ذهب عدن
- `scheduled-sar-update/` - تحديث مجدول للأسعار

#### 🗄️ قاعدة البيانات
- جداول العملات والأسعار
- سياسات الأمان (RLS)
- فهارس محسنة للأداء

### إعداد الإعلانات

#### تكوين AdMob:
1. إنشاء حساب AdMob من Google
2. الحصول على App ID ووضعه في `capacitor.config.ts`
3. إنشاء وحدات إعلانية Banner
4. استبدال معرفات الاختبار بالمعرفات الحقيقية

### إعدادات مهمة

#### شاشة البداية (Splash Screen):
- الصورة: `/lovable-uploads/bfcfa1bf-51a8-4cf1-ad10-24a06a782c51.png`
- المدة: 3 ثوانٍ
- لون الخلفية: `#8B4513`

#### الإذونات المطلوبة:
- الإنترنت (لتحديث الأسعار)
- حالة الشبكة
- إعلانات AdMob

## بنية المشروع

```
src/
├── components/          # مكونات واجهة المستخدم
├── hooks/              # خطافات React مخصصة
├── pages/              # صفحات التطبيق
├── utils/              # أدوات مساعدة
└── integrations/       # تكامل Supabase

supabase/
├── functions/          # وظائف الخلفية
└── config.toml        # إعدادات Supabase
```

## الملاحظات
- استخدم معرفات AdMob حقيقية في الإنتاج
- تأكد من تحديث أسماء الحزم قبل النشر
- اختبر التطبيق على أجهزة حقيقية
- راجع إعدادات الأمان في Supabase

## روابط مفيدة
- [مشروع Lovable](https://lovable.dev/projects/eba60485-e67c-44be-9844-41260bc973ea)
- [وثائق Capacitor](https://capacitorjs.com/docs)
- [وثائق Supabase](https://supabase.com/docs)
- [وثائق AdMob](https://developers.google.com/admob)
