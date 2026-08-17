# aden_currency_flutter

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

---

## الصور السحابية لمدن اليمن

سلايدر المدن وأزرار (صنعاء/عدن) تُحمَّل من **السحابة** (Supabase) بحيث يمكنك
تغيير المدينة وصورها **من حين لآخر دون إعادة بناء التطبيق**.

### خطوات إضافة/تحديث الصور

1. **أنشئ الجدول ودلو التخزين** (مرة واحدة) بتشغيل مِلَفّ الترحيل:
   `supabase/migrations/20260813-create-city-slides.sql`
   (ينشئ جدول `city_slides` ودلو عام `city-images` وسياسات قراءة عامة).

2. **ارفع الصور/الـ GIF** إلى دلو التخزين `city-images` (من لوحة Supabase →
   Storage → bucket `city-images` → Upload). تبقى الروابط على الصيغة:
   ```
   https://lgkexjmtzmcwfbkockwj.supabase.co/storage/v1/object/public/city-images/<اسم_الملف>
   ```

3. **حدِّث الجدول** (جدول `city_slides`) بروابط الصور لكل مدينة، مثل:
   ```sql
   update public.city_slides
   set image_url = 'https://lgkexjmtzmcwfbkockwj.supabase.co/storage/v1/object/public/city-images/sanaa.gif'
   where name_ar = 'صنعاء';
   ```
   يمكنك أيضاً إضافة مدن جديدة أو تغيير ترتيبها عبر الحقل `order`.

4. أعد فتح التطبيق (أو أعد الجلب) ليرى التغييرات. عند أي فشل اتصال أو خلوّ
   الجدول يعود التطبيق تلقائياً إلى الصور المحلية في
   `assets/images/gallery/`.

> ملاحظة: المسار السحابي في الكود يجلب الجدول عبر
> `GET /rest/v1/city_slides?select=*&order=order.asc` ويحمّل الصور عبر
> `CachedNetworkImage` (متوفرة كمكتبة في `pubspec.yaml`).

## مقاسات الصور الموصى بها

| الاستخدام | المقاس | الصيغة |
|---|---|---|
| صورة السلايدر (الخلفية) | 1600×700 تقريباً (نسبة 2:1) — الأهم وسط الصورة | JPG/PNG أو GIF للمتحرك |
| صورة زر المدينة (صنعاء/عدن) | مربعة 1:1 مثل 512×512 | JPG/PNG |
| صورة GIF متحركة | 720×450 تقريباً وأقل من 1-2 ميجابايت | GIF |

