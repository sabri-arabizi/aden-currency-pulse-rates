
-- تحديث الجدولة لتشغيل كل 30 دقيقة بدلاً من كل ساعة

-- حذف الجدولة القديمة إن وجدت
SELECT cron.unschedule('update-sar-prices-every-30min');
SELECT cron.unschedule('update-aed-prices-every-30min');
SELECT cron.unschedule('update-egp-prices-every-30min');

-- إضافة جدولة محسنة لتحديث أسعار الريال السعودي والدولار كل 30 دقيقة
SELECT cron.schedule(
  'update-sar-usd-prices-every-30min',
  '*/30 * * * *', -- كل 30 دقيقة
  $$
  SELECT net.http_post(
    url := 'https://lgkexjmtzmcwfbkockwj.supabase.co/functions/v1/update-sar-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0"}'::jsonb,
    body := '{"scheduled": true, "source": "ye-rial.com"}'::jsonb
  );
  $$
);

-- إضافة جدولة لتحديث أسعار الدرهم الإماراتي كل 30 دقيقة (بتأخير 10 دقائق)
SELECT cron.schedule(
  'update-aed-prices-every-30min-offset',
  '10,40 * * * *', -- في الدقيقة 10 و 40 من كل ساعة
  $$
  SELECT net.http_post(
    url := 'https://lgkexjmtzmcwfbkockwj.supabase.co/functions/v1/update-aed-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0"}'::jsonb,
    body := '{"scheduled": true, "source": "almashhadalaraby.com"}'::jsonb
  );
  $$
);

-- إضافة جدولة لتحديث أسعار الجنيه المصري كل 30 دقيقة (بتأخير 20 دقيقة)
SELECT cron.schedule(
  'update-egp-prices-every-30min-offset',
  '20,50 * * * *', -- في الدقيقة 20 و 50 من كل ساعة
  $$
  SELECT net.http_post(
    url := 'https://lgkexjmtzmcwfbkockwj.supabase.co/functions/v1/update-egp-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0"}'::jsonb,
    body := '{"scheduled": true, "source": "khbr.me"}'::jsonb
  );
  $$
);

-- عرض جميع المهام المجدولة الحالية
SELECT jobname, schedule, command FROM cron.job WHERE jobname LIKE '%update-%prices%';
