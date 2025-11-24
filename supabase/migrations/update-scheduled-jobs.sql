
-- تحديث الجدولة المحسنة لتشغيل كل ساعة مع دوال محسنة

-- حذف الجدولة القديمة إن وجدت
SELECT cron.unschedule('update-sar-usd-prices-every-30min');
SELECT cron.unschedule('update-aed-prices-every-30min-offset');
SELECT cron.unschedule('update-egp-prices-every-30min-offset');
SELECT cron.unschedule('scheduled-sar-update-hourly');

-- إضافة جدولة محسنة لتحديث أسعار الريال السعودي والدولار كل ساعة
SELECT cron.schedule(
  'update-sar-usd-enhanced-hourly',
  '0 * * * *', -- كل ساعة في الدقيقة 0
  $$
  SELECT net.http_post(
    url := 'https://lgkexjmtzmcwfbkockwj.supabase.co/functions/v1/update-sar-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0"}'::jsonb,
    body := '{"scheduled": true, "source": "ye-rial.com/aden", "version": "2.0-enhanced"}'::jsonb
  );
  $$
);

-- إضافة جدولة لتحديث أسعار الدرهم الإماراتي كل ساعة (بتأخير 15 دقيقة)
SELECT cron.schedule(
  'update-aed-prices-hourly-offset',
  '15 * * * *', -- في الدقيقة 15 من كل ساعة
  $$
  SELECT net.http_post(
    url := 'https://lgkexjmtzmcwfbkockwj.supabase.co/functions/v1/update-aed-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0"}'::jsonb,
    body := '{"scheduled": true, "source": "almashhadalaraby.com"}'::jsonb
  );
  $$
);

-- إضافة جدولة لتحديث أسعار الجنيه المصري المحسن كل ساعة (بتأخير 30 دقيقة)
SELECT cron.schedule(
  'update-egp-enhanced-hourly-offset',
  '30 * * * *', -- في الدقيقة 30 من كل ساعة
  $$
  SELECT net.http_post(
    url := 'https://lgkexjmtzmcwfbkockwj.supabase.co/functions/v1/update-egp-from-2dec',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0"}'::jsonb,
    body := '{"scheduled": true, "source": "2dec.net", "version": "2.0-enhanced"}'::jsonb
  );
  $$
);

-- إضافة جدولة لتحديث أسعار الذهب كل ساعة (بتأخير 45 دقيقة)
SELECT cron.schedule(
  'update-gold-prices-hourly-offset',
  '45 * * * *', -- في الدقيقة 45 من كل ساعة
  $$
  SELECT net.http_post(
    url := 'https://lgkexjmtzmcwfbkockwj.supabase.co/functions/v1/update-gold-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0"}'::jsonb,
    body := '{"scheduled": true, "source": "yemennownews.com"}'::jsonb
  );
  $$
);

-- عرض جميع المهام المجدولة الحالية
SELECT jobname, schedule, command FROM cron.job WHERE jobname LIKE '%update-%prices%';
