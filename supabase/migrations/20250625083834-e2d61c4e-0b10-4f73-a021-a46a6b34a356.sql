
-- حذف عملة اليورو من قاعدة البيانات
DELETE FROM public.exchange_rates WHERE currency_code = 'EUR';

-- إضافة الجنيه المصري لمدينة عدن
INSERT INTO public.exchange_rates (currency_code, currency_name, buy_price, sell_price, flag_url, city)
VALUES 
('EGP', 'جنيه مصري', 50.00, 52.00, 'https://flagcdn.com/w40/eg.png', 'عدن'),
('EGP', 'جنيه مصري', 50.50, 52.50, 'https://flagcdn.com/w40/eg.png', 'صنعاء')
ON CONFLICT DO NOTHING;

-- إنشاء فهرس فريد للعملة والمدينة (إذا لم يكن موجوداً)
CREATE UNIQUE INDEX IF NOT EXISTS exchange_rates_currency_city_idx 
ON public.exchange_rates (currency_code, city);
