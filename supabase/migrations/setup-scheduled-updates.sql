
-- Enable the cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule SAR price updates every 30 minutes
SELECT cron.schedule(
  'update-sar-prices-every-30min',
  '*/30 * * * *', -- Every 30 minutes
  $$
  SELECT net.http_post(
    url := 'https://lgkexjmtzmcwfbkockwj.supabase.co/functions/v1/update-sar-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  );
  $$
);

-- Schedule AED price updates every 30 minutes (offset by 15 minutes from SAR)
SELECT cron.schedule(
  'update-aed-prices-every-30min',
  '15,45 * * * *', -- At 15 and 45 minutes past every hour
  $$
  SELECT net.http_post(
    url := 'https://lgkexjmtzmcwfbkockwj.supabase.co/functions/v1/update-aed-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  );
  $$
);

-- Add AED currency to exchange_rates table if not exists
INSERT INTO public.exchange_rates (currency_code, currency_name, buy_price, sell_price, flag_url, city)
VALUES 
('AED', 'درهم إماراتي', 690.00, 694.00, 'https://flagcdn.com/w40/ae.png', 'صنعاء'),
('AED', 'درهم إماراتي', 688.00, 692.00, 'https://flagcdn.com/w40/ae.png', 'عدن')
ON CONFLICT (currency_code, city) DO NOTHING;

-- View all scheduled jobs
SELECT jobname, schedule, command FROM cron.job WHERE jobname LIKE '%update-%prices%';
