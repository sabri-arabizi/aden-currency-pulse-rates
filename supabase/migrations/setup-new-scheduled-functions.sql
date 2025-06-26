
-- إعداد الجدولة التلقائية للوظائف الجديدة

-- حذف أي جدولة قديمة إن وجدت
SELECT cron.unschedule('update-sanaa-rates-hourly');
SELECT cron.unschedule('update-aden-gold-from-souta-hourly');

-- جدولة تحديث أسعار الصرف لصنعاء من khbr.me كل ساعة (في الدقيقة 10)
SELECT cron.schedule(
  'update-sanaa-rates-hourly',
  '10 * * * *', -- في الدقيقة 10 من كل ساعة
  $$
  SELECT net.http_post(
    url := 'https://lgkexjmtzmcwfbkockwj.supabase.co/functions/v1/update-sanaa-rates-from-khbr',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0"}'::jsonb,
    body := '{"scheduled": true, "source": "khbr.me/rate.html"}'::jsonb
  );
  $$
);

-- جدولة تحديث أسعار الذهب لعدن من soutalmukawama.com كل ساعة (في الدقيقة 25)
SELECT cron.schedule(
  'update-aden-gold-from-souta-hourly',
  '25 * * * *', -- في الدقيقة 25 من كل ساعة
  $$
  SELECT net.http_post(
    url := 'https://lgkexjmtzmcwfbkockwj.supabase.co/functions/v1/update-aden-gold-from-souta',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0"}'::jsonb,
    body := '{"scheduled": true, "source": "soutalmukawama.com/cat/5"}'::jsonb
  );
  $$
);

-- عرض جميع المهام المجدولة الحالية
SELECT jobname, schedule, command FROM cron.job WHERE jobname LIKE '%update-%';
