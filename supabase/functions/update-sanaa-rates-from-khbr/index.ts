
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🏛️ بدء تحديث أسعار الصرف لصنعاء من ye-rial.com/sanaa')

    // جلب البيانات من موقع صنعاء المحدد
    const response = await fetch('https://ye-rial.com/sanaa/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.5',
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP خطأ! الحالة: ${response.status}`)
    }

    const html = await response.text()
    console.log('✅ تم جلب HTML من ye-rial.com/sanaa، بدء استخراج أسعار الصرف...')

    // دالة تنظيف الأرقام مع دعم الأرقام العربية والإنجليزية
    const cleanNumber = (numStr: string): number => {
      if (!numStr) return 0;
      
      const cleaned = numStr
        .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
        .replace(/[,،]/g, '')
        .replace(/\s+/g, '')
        .trim();
      
      const number = parseFloat(cleaned);
      return isNaN(number) ? 0 : number;
    };

    const updates = [];

    // البحث المحسن عن أسعار الريال السعودي
    const sarPatterns = [
      /<tr[^>]*>[\s\S]*?(?:ريال\s*سعودي|سعودي|SAR)[\s\S]*?<td[^>]*>\s*(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>\s*<td[^>]*>\s*(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>[\s\S]*?<\/tr>/gi,
      /(?:ريال\s*سعودي|سعودي|SAR)[\s\S]{0,100}?شراء[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,100}?بيع[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi,
      /(?:ريال\s*سعودي|سعودي|SAR)[\s\S]{0,100}?بيع[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,100}?شراء[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi
    ];

    // البحث المحسن عن أسعار الدولار الأمريكي
    const usdPatterns = [
      /<tr[^>]*>[\s\S]*?(?:دولار\s*أمريكي|دولار|USD)[\s\S]*?<td[^>]*>\s*(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>\s*<td[^>]*>\s*(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>[\s\S]*?<\/tr>/gi,
      /(?:دولار\s*أمريكي|دولار|USD)[\s\S]{0,100}?شراء[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,100}?بيع[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi,
      /(?:دولار\s*أمريكي|دولار|USD)[\s\S]{0,100}?بيع[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,100}?شراء[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi
    ];

    // البحث عن أسعار الدرهم الإماراتي
    const aedPatterns = [
      /<tr[^>]*>[\s\S]*?(?:درهم\s*إمارات|إمارات|AED)[\s\S]*?<td[^>]*>\s*(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>\s*<td[^>]*>\s*(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>[\s\S]*?<\/tr>/gi,
      /(?:درهم\s*إمارات|إمارات|AED)[\s\S]{0,100}?شراء[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,100}?بيع[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi,
      /(?:درهم\s*إمارات|إمارات|AED)[\s\S]{0,100}?بيع[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,100}?شراء[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi
    ];

    // البحث عن أسعار الجنيه المصري
    const egpPatterns = [
      /<tr[^>]*>[\s\S]*?(?:جنيه\s*مصري|مصري|EGP)[\s\S]*?<td[^>]*>\s*(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>\s*<td[^>]*>\s*(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>[\s\S]*?<\/tr>/gi,
      /(?:جنيه\s*مصري|مصري|EGP)[\s\S]{0,100}?شراء[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,100}?بيع[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi,
      /(?:جنيه\s*مصري|مصري|EGP)[\s\S]{0,100}?بيع[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,100}?شراء[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi
    ];

    const currencies = [
      { code: 'SAR', name: 'ريال سعودي', patterns: sarPatterns },
      { code: 'USD', name: 'دولار أمريكي', patterns: usdPatterns },
      { code: 'AED', name: 'درهم إماراتي', patterns: aedPatterns },
      { code: 'EGP', name: 'جنيه مصري', patterns: egpPatterns }
    ];

    // معالجة كل عملة
    for (const currency of currencies) {
      let buyPrice = 0, sellPrice = 0;

      // البحث عن الأسعار
      for (const pattern of currency.patterns) {
        const matches = [...html.matchAll(pattern)];
        for (const match of matches) {
          if (match && match[1] && match[2]) {
            const price1 = cleanNumber(match[1]);
            const price2 = cleanNumber(match[2]);
            
            if (price1 > 0 && price2 > 0) {
              // تحديد أيهما الشراء وأيهما البيع (عادة الشراء أقل من البيع)
              buyPrice = Math.min(price1, price2);
              sellPrice = Math.max(price1, price2);
              console.log(`🏦 تم العثور على أسعار ${currency.code}: شراء ${buyPrice}, بيع ${sellPrice}`);
              break;
            }
          }
        }
        if (buyPrice > 0 && sellPrice > 0) break;
      }

      // إذا لم يتم العثور على أسعار، احسب من الدولار أو استخدم أسعار افتراضية
      if (buyPrice === 0 || sellPrice === 0) {
        console.log(`⚠️ لم يتم العثور على أسعار ${currency.code} صحيحة، سيتم استخدام أسعار عدن`);
        
        // الحصول على أسعار عدن كنموذج
        const { data: adenRate } = await supabaseClient
          .from('exchange_rates')
          .select('buy_price, sell_price')
          .eq('currency_code', currency.code)
          .eq('city', 'عدن')
          .single();

        if (adenRate) {
          buyPrice = adenRate.buy_price;
          sellPrice = adenRate.sell_price;
        } else {
          // أسعار افتراضية
          const defaultPrices = {
            'SAR': { buy: 675, sell: 680 },
            'USD': { buy: 2540, sell: 2550 },
            'AED': { buy: 690, sell: 695 },
            'EGP': { buy: 50, sell: 52 }
          };
          buyPrice = defaultPrices[currency.code]?.buy || 0;
          sellPrice = defaultPrices[currency.code]?.sell || 0;
        }
      }

      if (buyPrice > 0 && sellPrice > 0) {
        const { error } = await supabaseClient
          .from('exchange_rates')
          .update({
            buy_price: buyPrice,
            sell_price: sellPrice,
            updated_at: new Date().toISOString()
          })
          .eq('currency_code', currency.code)
          .eq('city', 'صنعاء');

        if (error) {
          console.error(`❌ خطأ في تحديث ${currency.name} لصنعاء:`, error);
        } else {
          console.log(`✅ تم تحديث ${currency.name} بنجاح لصنعاء`);
          updates.push(`${currency.code}-صنعاء`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم تحديث أسعار الصرف لصنعاء بنجاح',
        updates: updates,
        timestamp: new Date().toISOString(),
        source: 'ye-rial.com/sanaa'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ خطأ في تحديث أسعار صنعاء:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
