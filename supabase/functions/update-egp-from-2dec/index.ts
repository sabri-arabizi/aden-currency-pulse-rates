
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

    console.log('🔥 بدء التحليل المحسن لأسعار الجنيه المصري من 2dec.net')

    // جلب البيانات من الموقع مع headers محسنة ومتقدمة
    const response = await fetch('https://2dec.net/rate.htm', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Connection': 'keep-alive'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    console.log('✅ تم جلب HTML من 2dec.net بنجاح، بدء التحليل المتقدم...')

    // دالة تنظيف وتحويل الأرقام مع دعم كامل للخانات العشرية
    const cleanAndParseNumber = (numStr: string): number => {
      if (!numStr) return 0;
      
      // تحويل الأرقام العربية إلى إنجليزية
      let cleaned = numStr
        .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
        .replace(/[,،]/g, '') // إزالة الفواصل
        .replace(/[^\d.]/g, '') // الاحتفاظ بالأرقام والنقاط فقط
        .trim();
      
      const number = parseFloat(cleaned);
      return isNaN(number) ? 0 : number;
    };

    // أنماط البحث المحسنة والمتقدمة للجنيه المصري
    const egpPatterns = [
      // البحث في الجداول المنظمة بتفصيل أكبر
      /<tr[^>]*>[\s\S]*?(?:جنيه\s*مصري|مصري|EGP|egypt|Egyptian)[\s\S]*?<td[^>]*>\s*(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>\s*<td[^>]*>\s*(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)\s*<\/td>[\s\S]*?<\/tr>/gi,
      
      // البحث في العناصر المباشرة مع شراء وبيع
      /(?:جنيه\s*مصري|مصري|EGP|egypt)[\s\S]{0,200}?(?:شراء|buy)[\s\S]{0,100}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,200}?(?:بيع|sell)[\s\S]{0,100}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi,
      
      // البحث المعكوس بيع ثم شراء
      /(?:جنيه\s*مصري|مصري|EGP|egypt)[\s\S]{0,200}?(?:بيع|sell)[\s\S]{0,100}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,200}?(?:شراء|buy)[\s\S]{0,100}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi,
      
      // البحث في أقسام مخصصة لعدن
      /(?:عدن|aden)[\s\S]{0,300}?(?:جنيه\s*مصري|مصري|EGP)[\s\S]{0,200}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi,
      
      // البحث العام في النص مع تحديد نطاق أكبر
      /(?:جنيه\s*مصري|egyptian\s*pound|EGP)[\s\S]{0,500}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]{0,100}?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/gi,
      
      // البحث في العناصر المنظمة بـ class أو id
      /<(?:div|span|p)[^>]*(?:class|id)="[^"]*(?:egp|egypt|مصري)[^"]*"[^>]*>[\s\S]*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]*?(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)[\s\S]*?<\/(?:div|span|p)>/gi
    ];

    let egpBuyPrice = 0;
    let egpSellPrice = 0;

    // البحث المتقدم باستخدام جميع الأنماط
    for (const pattern of egpPatterns) {
      const matches = [...html.matchAll(pattern)];
      for (const match of matches) {
        if (match && match[1] && match[2]) {
          const price1 = cleanAndParseNumber(match[1]);
          const price2 = cleanAndParseNumber(match[2]);
          
          // التحقق من صحة الأسعار (نطاق منطقي للجنيه المصري)
          if (price1 > 0 && price2 > 0 && price1 >= 50 && price1 <= 200 && price2 >= 50 && price2 <= 200) {
            // تحديد أيهما الشراء وأيهما البيع (عادة الشراء أقل من البيع)
            egpBuyPrice = Math.min(price1, price2);
            egpSellPrice = Math.max(price1, price2);
            console.log(`💰 تم العثور على أسعار EGP متقدمة: شراء ${egpBuyPrice}, بيع ${egpSellPrice}`);
            break;
          }
        }
      }
      if (egpBuyPrice > 0 && egpSellPrice > 0) break;
    }

    // إذا لم نجد الأسعار، نبحث في جداول HTML بطريقة أكثر تفصيلاً
    if (!egpBuyPrice || !egpSellPrice) {
      console.log('🔍 البحث التفصيلي في جداول HTML...')
      
      // استخراج جميع الجداول
      const tablePattern = /<table[^>]*>[\s\S]*?<\/table>/gi
      const tableMatches = [...html.matchAll(tablePattern)];
      
      for (const tableMatch of tableMatches) {
        const tableHtml = tableMatch[0];
        
        // التحقق من وجود كلمات مفتاحية للجنيه المصري
        if (tableHtml.includes('مصري') || tableHtml.includes('EGP') || tableHtml.includes('egypt') || tableHtml.includes('Egyptian')) {
          console.log('📊 وُجدت جدول يحتوي على بيانات الجنيه المصري')
          
          // استخراج جميع الأرقام من الجدول
          const numberPattern = /(\d+(?:[,.]?\d+)*(?:\.\d{1,4})?)/g
          const numbers = [...tableHtml.matchAll(numberPattern)]
            .map(match => cleanAndParseNumber(match[1]))
            .filter(num => !isNaN(num) && num >= 50 && num <= 200)
            .sort((a, b) => a - b); // ترتيب تصاعدي
          
          if (numbers.length >= 2) {
            egpBuyPrice = numbers[0]; // أقل رقم عادة يكون الشراء
            egpSellPrice = numbers[numbers.length - 1]; // أعلى رقم عادة يكون البيع
            console.log(`📈 أسعار مستخرجة من الجدول - شراء: ${egpBuyPrice}, بيع: ${egpSellPrice}`);
            break;
          }
        }
      }
    }

    // البحث الاحتياطي في النص الكامل
    if (!egpBuyPrice || !egpSellPrice) {
      console.log('🎯 البحث الاحتياطي في النص الكامل...')
      
      // استخراج جميع الأرقام ذات الصلة
      const allNumbersPattern = /(\d{2,3}(?:\.\d{1,4})?)/g
      const allNumbers = [...html.matchAll(allNumbersPattern)]
        .map(match => cleanAndParseNumber(match[1]))
        .filter(num => !isNaN(num) && num >= 70 && num <= 85) // نطاق أضيق للجنيه المصري
        .sort((a, b) => a - b);
      
      if (allNumbers.length >= 2) {
        egpBuyPrice = allNumbers[0];
        egpSellPrice = allNumbers[allNumbers.length - 1];
        console.log(`🔧 أسعار احتياطية - شراء: ${egpBuyPrice}, بيع: ${egpSellPrice}`);
      }
    }

    console.log(`📊 النتيجة النهائية - EGP شراء: ${egpBuyPrice}, EGP بيع: ${egpSellPrice}`)

    const updates = [];

    if (egpBuyPrice && egpSellPrice && egpBuyPrice > 0 && egpSellPrice > 0) {
      console.log(`✅ تم العثور على أسعار EGP محسنة - شراء: ${egpBuyPrice}, بيع: ${egpSellPrice}`)

      // تحديث الجنيه المصري لكلا المدينتين
      for (const city of ['عدن', 'صنعاء']) {
        const { error } = await supabaseClient
          .from('exchange_rates')
          .update({
            buy_price: egpBuyPrice,
            sell_price: egpSellPrice,
            updated_at: new Date().toISOString()
          })
          .eq('currency_code', 'EGP')
          .eq('city', city)

        if (error) {
          console.error(`❌ خطأ في تحديث EGP لـ ${city}:`, error)
        } else {
          console.log(`✅ تم تحديث EGP بنجاح لـ ${city}`)
          updates.push(`EGP-${city}`)
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'تم تحديث أسعار الجنيه المصري المحسن بنجاح من 2dec.net',
          updates: updates,
          prices: { buy: egpBuyPrice, sell: egpSellPrice },
          source: '2dec.net',
          version: '2.0 - Enhanced',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      console.log('❌ لم يتم العثور على أسعار EGP صحيحة في محتوى الصفحة')
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'لم يتم العثور على أسعار الجنيه المصري في الموقع',
          source: '2dec.net',
          version: '2.0 - Enhanced',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

  } catch (error) {
    console.error('❌ خطأ في تحديث أسعار EGP المحسن من 2dec.net:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        source: '2dec.net',
        version: '2.0 - Enhanced',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
