
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

    console.log('🏛️ بدء تحديث أسعار الصرف لصنعاء من khbr.me')

    const response = await fetch('https://www.khbr.me/rate.html', {
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
    console.log('✅ تم جلب HTML من khbr.me، بدء استخراج أسعار الصرف...')

    // دالة تنظيف الأرقام
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

    // استخراج أسعار العملات المختلفة
    const currencies = [
      { code: 'SAR', name: 'ريال سعودي', patterns: [
        /ريال\s*سعودي.*?شراء.*?(\d+(?:[,.]?\d+)*).*?بيع.*?(\d+(?:[,.]?\d+)*)/gi,
        /سعودي.*?(\d+(?:[,.]?\d+)*).*?(\d+(?:[,.]?\d+)*)/gi
      ]},
      { code: 'USD', name: 'دولار أمريكي', patterns: [
        /دولار.*?أمريكي.*?شراء.*?(\d+(?:[,.]?\d+)*).*?بيع.*?(\d+(?:[,.]?\d+)*)/gi,
        /دولار.*?(\d+(?:[,.]?\d+)*).*?(\d+(?:[,.]?\d+)*)/gi
      ]},
      { code: 'AED', name: 'درهم إماراتي', patterns: [
        /درهم.*?إماراتي.*?شراء.*?(\d+(?:[,.]?\d+)*).*?بيع.*?(\d+(?:[,.]?\d+)*)/gi,
        /إماراتي.*?(\d+(?:[,.]?\d+)*).*?(\d+(?:[,.]?\d+)*)/gi
      ]},
      { code: 'EGP', name: 'جنيه مصري', patterns: [
        /جنيه.*?مصري.*?شراء.*?(\d+(?:[,.]?\d+)*).*?بيع.*?(\d+(?:[,.]?\d+)*)/gi,
        /مصري.*?(\d+(?:[,.]?\d+)*).*?(\d+(?:[,.]?\d+)*)/gi
      ]}
    ];

    // معالجة كل عملة
    for (const currency of currencies) {
      let buyPrice = 0;
      let sellPrice = 0;

      // جرب كل النماذج للعملة
      for (const pattern of currency.patterns) {
        const match = pattern.exec(html);
        if (match && match[1] && match[2]) {
          buyPrice = cleanNumber(match[1]);
          sellPrice = cleanNumber(match[2]);
          
          if (buyPrice > 0 && sellPrice > 0) {
            console.log(`💰 تم العثور على أسعار ${currency.name}: شراء ${buyPrice}, بيع ${sellPrice}`);
            break;
          }
        }
      }

      // إذا لم نجد أسعار، استخدم أسعار افتراضية أو احدث أسعار من عدن
      if (buyPrice === 0 || sellPrice === 0) {
        const { data: adenRate } = await supabaseClient
          .from('exchange_rates')
          .select('buy_price, sell_price')
          .eq('currency_code', currency.code)
          .eq('city', 'عدن')
          .single();

        if (adenRate) {
          buyPrice = adenRate.buy_price;
          sellPrice = adenRate.sell_price;
          console.log(`📋 استخدم أسعار عدن لـ ${currency.name}: شراء ${buyPrice}, بيع ${sellPrice}`);
        }
      }

      // تحديث أو إنشاء السجل في صنعاء
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
        source: 'khbr.me/rate.html'
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
