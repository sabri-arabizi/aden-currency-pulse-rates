
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

    console.log('🚀 بدء تحديث أسعار SAR و USD المحسن من ye-rial.com/aden')

    // جلب البيانات من الموقع مع headers محسنة
    const response = await fetch('https://ye-rial.com/aden/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://ye-rial.com/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP خطأ! الحالة: ${response.status}`)
    }

    const html = await response.text()
    console.log('✅ تم جلب HTML بنجاح، بدء التحليل المحسن للأسعار...')

    // دالة تنظيف وتحويل الأرقام مع دعم الخانات العشرية
    const cleanAndParseNumber = (numStr: string): number => {
      if (!numStr) return 0;
      
      // تحويل الأرقام العربية إلى إنجليزية
      const arabicToEnglish = numStr
        .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
        .replace(/[,،]/g, '') // إزالة الفواصل
        .replace(/\s+/g, '') // إزالة المسافات
        .trim();
      
      const number = parseFloat(arabicToEnglish);
      return isNaN(number) ? 0 : number;
    };

    // البحث المحسن عن أسعار الريال السعودي مع دعم الجداول والنماذج المختلفة
    const sarPatterns = [
      // البحث في الجداول المنظمة
      /<tr[^>]*>[\s\S]*?(?:ريال\s*سعودي|سعودي|SAR)[\s\S]*?<td[^>]*>\s*(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>\s*<td[^>]*>\s*(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>[\s\S]*?<\/tr>/gi,
      
      // البحث في divs أو spans
      /<div[^>]*>[\s\S]*?(?:ريال\s*سعودي|سعودي|SAR)[\s\S]*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*[\s\S]*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*[\s\S]*?<\/div>/gi,
      
      // البحث العام مع كلمات الشراء والبيع
      /(?:ريال\s*سعودي|سعودي|SAR)[\s\S]{0,100}?شراء[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,100}?بيع[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi,
      
      // البحث المعكوس للشراء والبيع
      /(?:ريال\s*سعودي|سعودي|SAR)[\s\S]{0,100}?بيع[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,100}?شراء[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi
    ];

    // البحث المحسن عن أسعار الدولار الأمريكي
    const usdPatterns = [
      // البحث في الجداول المنظمة
      /<tr[^>]*>[\s\S]*?(?:دولار\s*أمريكي|دولار|USD)[\s\S]*?<td[^>]*>\s*(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>\s*<td[^>]*>\s*(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>[\s\S]*?<\/tr>/gi,
      
      // البحث في divs أو spans  
      /<div[^>]*>[\s\S]*?(?:دولار\s*أمريكي|دولار|USD)[\s\S]*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*[\s\S]*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*[\s\S]*?<\/div>/gi,
      
      // البحث العام مع كلمات الشراء والبيع
      /(?:دولار\s*أمريكي|دولار|USD)[\s\S]{0,100}?شراء[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,100}?بيع[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi,
      
      // البحث المعكوس للشراء والبيع
      /(?:دولار\s*أمريكي|دولار|USD)[\s\S]{0,100}?بيع[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,100}?شراء[\s\S]{0,50}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi
    ];

    let sarBuyPrice = 0, sarSellPrice = 0;
    let usdBuyPrice = 0, usdSellPrice = 0;

    // البحث عن أسعار الريال السعودي
    for (const pattern of sarPatterns) {
      const matches = [...html.matchAll(pattern)];
      for (const match of matches) {
        if (match && match[1] && match[2]) {
          const price1 = cleanAndParseNumber(match[1]);
          const price2 = cleanAndParseNumber(match[2]);
          
          if (price1 > 0 && price2 > 0 && price1 < 1000 && price2 < 1000) {
            // تحديد أيهما الشراء وأيهما البيع (عادة الشراء أقل من البيع)
            sarBuyPrice = Math.min(price1, price2);
            sarSellPrice = Math.max(price1, price2);
            console.log(`🏦 تم العثور على أسعار SAR: شراء ${sarBuyPrice}, بيع ${sarSellPrice}`);
            break;
          }
        }
      }
      if (sarBuyPrice > 0 && sarSellPrice > 0) break;
    }

    // البحث عن أسعار الدولار الأمريكي
    for (const pattern of usdPatterns) {
      const matches = [...html.matchAll(pattern)];
      for (const match of matches) {
        if (match && match[1] && match[2]) {
          const price1 = cleanAndParseNumber(match[1]);
          const price2 = cleanAndParseNumber(match[2]);
          
          if (price1 > 0 && price2 > 0 && price1 < 10000 && price2 < 10000) {
            // تحديد أيهما الشراء وأيهما البيع (عادة الشراء أقل من البيع)
            usdBuyPrice = Math.min(price1, price2);
            usdSellPrice = Math.max(price1, price2);
            console.log(`💵 تم العثور على أسعار USD: شراء ${usdBuyPrice}, بيع ${usdSellPrice}`);
            break;
          }
        }
      }
      if (usdBuyPrice > 0 && usdSellPrice > 0) break;
    }

    const updates = [];

    // تحديث الريال السعودي إذا تم العثور على الأسعار
    if (sarBuyPrice > 0 && sarSellPrice > 0) {
      for (const city of ['عدن', 'صنعاء']) {
        const { error } = await supabaseClient
          .from('exchange_rates')
          .update({
            buy_price: sarBuyPrice,
            sell_price: sarSellPrice,
            updated_at: new Date().toISOString()
          })
          .eq('currency_code', 'SAR')
          .eq('city', city);

        if (error) {
          console.error(`❌ خطأ في تحديث SAR لـ ${city}:`, error);
        } else {
          console.log(`✅ تم تحديث SAR بنجاح لـ ${city}`);
          updates.push(`SAR-${city}`);
        }
      }
    } else {
      console.log('⚠️ لم يتم العثور على أسعار SAR صحيحة');
    }

    // تحديث الدولار الأمريكي إذا تم العثور على الأسعار
    if (usdBuyPrice > 0 && usdSellPrice > 0) {
      for (const city of ['عدن', 'صنعاء']) {
        const { error } = await supabaseClient
          .from('exchange_rates')
          .update({
            buy_price: usdBuyPrice,
            sell_price: usdSellPrice,
            updated_at: new Date().toISOString()
          })
          .eq('currency_code', 'USD')
          .eq('city', city);

        if (error) {
          console.error(`❌ خطأ في تحديث USD لـ ${city}:`, error);
        } else {
          console.log(`✅ تم تحديث USD بنجاح لـ ${city}`);
          updates.push(`USD-${city}`);
        }
      }
    } else {
      console.log('⚠️ لم يتم العثور على أسعار USD صحيحة');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم تحديث أسعار SAR و USD المحسن بنجاح',
        updates: updates,
        extractedPrices: {
          SAR: { buy: sarBuyPrice, sell: sarSellPrice },
          USD: { buy: usdBuyPrice, sell: usdSellPrice }
        },
        timestamp: new Date().toISOString(),
        source: 'ye-rial.com/aden (محسن)',
        version: '2.0 - Enhanced'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ خطأ في تحديث أسعار SAR و USD المحسن:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString(),
        source: 'ye-rial.com/aden (محسن)'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
