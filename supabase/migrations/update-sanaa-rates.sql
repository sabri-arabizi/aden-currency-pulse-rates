
-- تحديث أسعار صنعاء لتطابق أسعار عدن (الأسعار السابقة)
-- تحديث الجنيه المصري للأسعار المطلوبة

-- تحديث الجنيه المصري في عدن
UPDATE exchange_rates 
SET 
  buy_price = 79.24,
  sell_price = 80.00,
  updated_at = now()
WHERE currency_code = 'EGP' AND city = 'عدن';

-- تحديث الجنيه المصري في صنعاء بنفس الأسعار
UPDATE exchange_rates 
SET 
  buy_price = 79.24,
  sell_price = 80.00,
  updated_at = now()
WHERE currency_code = 'EGP' AND city = 'صنعاء';

-- تحديث باقي العملات في صنعاء لتطابق عدن
UPDATE sanaa_rates 
SET 
  buy_price = aden_rates.buy_price,
  sell_price = aden_rates.sell_price,
  updated_at = now()
FROM 
  (SELECT currency_code, buy_price, sell_price FROM exchange_rates WHERE city = 'عدن') AS aden_rates
WHERE 
  sanaa_rates.currency_code = aden_rates.currency_code 
  AND sanaa_rates.city = 'صنعاء'
  AND sanaa_rates.currency_code != 'EGP';

-- نسخة بديلة باستخدام UPDATE مع subquery
UPDATE exchange_rates AS sanaa_rates
SET 
  buy_price = aden_rates.buy_price,
  sell_price = aden_rates.sell_price,
  updated_at = now()
FROM exchange_rates AS aden_rates
WHERE 
  sanaa_rates.city = 'صنعاء'
  AND aden_rates.city = 'عدن'
  AND sanaa_rates.currency_code = aden_rates.currency_code
  AND sanaa_rates.currency_code != 'EGP';

-- تحديث الجدولة لتكون كل ساعة بدلاً من 30 دقيقة
SELECT cron.unschedule('update-sar-usd-prices-every-30min');
SELECT cron.unschedule('update-aed-prices-every-30min-offset');
SELECT cron.unschedule('update-egp-prices-every-30min-offset');

-- جدولة تحديث SAR و USD كل ساعة
SELECT cron.schedule(
  'update-sar-usd-prices-hourly',
  '0 * * * *', -- كل ساعة في الدقيقة 0
  $$
  SELECT net.http_post(
    url := 'https://lgkexjmtzmcwfbkockwj.supabase.co/functions/v1/update-sar-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0"}'::jsonb,
    body := '{"scheduled": true, "source": "ye-rial.com"}'::jsonb
  );
  $$
);

-- جدولة تحديث AED كل ساعة (بتأخير 20 دقيقة)
SELECT cron.schedule(
  'update-aed-prices-hourly',
  '20 * * * *', -- في الدقيقة 20 من كل ساعة
  $$
  SELECT net.http_post(
    url := 'https://lgkexjmtzmcwfbkockwj.supabase.co/functions/v1/update-aed-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0"}'::jsonb,
    body := '{"scheduled": true, "source": "almashhadalaraby.com"}'::jsonb
  );
  $$
);

-- جدولة تحديث EGP كل ساعة (بتأخير 40 دقيقة)
SELECT cron.schedule(
  'update-egp-prices-hourly',
  '40 * * * *', -- في الدقيقة 40 من كل ساعة
  $$
  SELECT net.http_post(
    url := 'https://lgkexjmtzmcwfbkockwj.supabase.co/functions/v1/update-egp-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0"}'::jsonb,
    body := '{"scheduled": true, "source": "khbr.me"}'::jsonb
  );
  $$
);
