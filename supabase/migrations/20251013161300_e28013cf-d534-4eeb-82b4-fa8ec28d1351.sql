-- تحديث سعر الدرهم الإماراتي في صنعاء إلى القيم الثابتة المطلوبة
UPDATE exchange_rates 
SET 
  buy_price = 148.10,
  sell_price = 149.00,
  updated_at = now()
WHERE currency_code = 'AED' 
  AND city = 'صنعاء';