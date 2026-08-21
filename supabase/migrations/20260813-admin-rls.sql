-- سياسات لوحة التحكم: تسمح للوحة التحكم (via أنون كي) بتعديل المدن ورفع الصور.
-- ملاحظة أمان: هذه سياسات قراءة/كتابة عامة للمشروع الصغير؛ إن احتجت حماية
-- أعلى استبدلها بمصادقة (Auth) أو أحصرها بمفتاح خدمة.

-- الكتابة على جدول city_slides (إدراج/تحديث/حذف).
drop policy if exists "city_slides public insert" on public.city_slides;
create policy "city_slides public insert"
  on public.city_slides for insert with check (true);

drop policy if exists "city_slides public update" on public.city_slides;
create policy "city_slides public update"
  on public.city_slides for update using (true);

drop policy if exists "city_slides public delete" on public.city_slides;
create policy "city_slides public delete"
  on public.city_slides for delete using (true);

-- رفع/تحديث/حذف الصور في دلو city-images.
drop policy if exists "city-images public insert" on storage.objects;
create policy "city-images public insert"
  on storage.objects for insert with check (bucket_id = 'city-images');

drop policy if exists "city-images public update" on storage.objects;
create policy "city-images public update"
  on storage.objects for update using (bucket_id = 'city-images');

drop policy if exists "city-images public delete" on storage.objects;
create policy "city-images public delete"
  on storage.objects for delete using (bucket_id = 'city-images');
