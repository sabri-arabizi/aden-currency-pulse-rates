
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

    console.log('🚀 بدء تحديث أسعار SAR و USD من ye-rial.com/aden')

    // جلب البيانات من الموقع
    const response = await fetch('https://ye-rial.com/aden/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP خطأ! الحالة: ${response.status}`)
    }

    const html = await response.text()
    console.log('✅ تم جلب HTML بنجاح، بدء تحليل الأسعار...')

    // دالة تنظيف الأرقام العربية والإنجليزية
    const cleanNumber = (numStr: string): number => {
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

    // البحث عن أسعار الريال السعودي بطرق متعددة
    const sarPatterns = [
      // نماذج متنوعة للبحث عن الريال السعودي
      /<td[^>]*>.*?(?:ريال\s*سعودي|سعودي|SAR).*?<\/td>\s*<td[^>]*>.*?(\d+(?:[,.]?\d+)*)\s*<\/td>\s*<td[^>]*>.*?(\d+(?:[,.]?\d+)*)\s*<\/td>/gi,
      /(?:ريال\s*سعودي|سعودي|SAR).*?شراء.*?(\d+(?:[,.]?\d+)*).*?بيع.*?(\d+(?:[,.]?\d+)*)/gi,
      /(?:ريال\s*سعودي|سعودي|SAR).*?(\d+(?:[,.]?\d+)*).*?(\d+(?:[,.]?\d+)*)/gi,
      /<tr[^>]*>.*?(?:ريال\s*سعودي|سعودي|SAR).*?<td[^>]*>.*?(\d+(?:[,.]?\d+)*).*?<\/td>.*?<td[^>]*>.*?(\d+(?:[,.]?\d+)*).*?<\/td>/gi
    ];

    // البحث عن أسعار الدولار الأمريكي
    const usdPatterns = [
      /<td[^>]*>.*?(?:دولار\s*أمريكي|دولار|USD).*?<\/td>\s*<td[^>]*>.*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>\s*<td[^>]*>.*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>/gi,
      /(?:دولار\s*أمريكي|دولار|USD).*?شراء.*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?).*?بيع.*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi,
      /(?:دولار\s*أمريكي|دولار|USD).*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?).*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi,
      /<tr[^>]*>.*?(?:دولار\s*أمريكي|دولار|USD).*?<td[^>]*>.*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?).*?<\/td>.*?<td[^>]*>.*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?).*?<\/td>/gi
    ];

    let sarBuyPrice = 0, sarSellPrice = 0;
    let usdBuyPrice = 0, usdSellPrice = 0;

    // البحث عن أسعار الريال السعودي
    for (const pattern of sarPatterns) {
      const match = pattern.exec(html);
      if (match && match[1] && match[2]) {
        sarBuyPrice = cleanNumber(match[1]);
        sarSellPrice = cleanNumber(match[2]);
        if (sarBuyPrice > 0 && sarSellPrice > 0) {
          console.log(`🏦 تم العثور على أسعار SAR: شراء ${sarBuyPrice}, بيع ${sarSellPrice}`);
          break;
        }
      }
    }

    // البحث عن أسعار الدولار الأمريكي
    for (const pattern of usdPatterns) {
      const match = pattern.exec(html);
      if (match && match[1] && match[2]) {
        usdBuyPrice = cleanNumber(match[1]);
        usdSellPrice = cleanNumber(match[2]);
        if (usdBuyPrice > 0 && usdSellPrice > 0) {
          console.log(`💵 تم العثور على أسعار USD: شراء ${usdBuyPrice}, بيع ${usdSellPrice}`);
          break;
        }
      }
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
        message: 'تم تحديث أسعار SAR و USD بنجاح',
        updates: updates,
        extractedPrices: {
          SAR: { buy: sarBuyPrice, sell: sarSellPrice },
          USD: { buy: usdBuyPrice, sell: usdSellPrice }
        },
        timestamp: new Date().toISOString(),
        source: 'ye-rial.com/aden'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ خطأ في تحديث أسعار SAR و USD:', error)
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
