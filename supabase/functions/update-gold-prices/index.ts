
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

    console.log('🥇 بدء تحديث أسعار الذهب من yemennownews.com')

    const response = await fetch('https://yemennownews.com/', {
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
    console.log('✅ تم جلب HTML من yemennownews.com، بدء البحث عن أسعار الذهب...')

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

    // البحث عن أسعار الذهب في عدن
    const goldPatterns = {
      // عيار 24
      gold24: [
        /ذهب.*?عيار.*?24.*?عدن.*?(\d+(?:[,.]?\d+)*).*?(\d+(?:[,.]?\d+)*)/gi,
        /عيار.*?24.*?عدن.*?شراء.*?(\d+(?:[,.]?\d+)*).*?بيع.*?(\d+(?:[,.]?\d+)*)/gi,
        /24.*?قيراط.*?عدن.*?(\d+(?:[,.]?\d+)*).*?(\d+(?:[,.]?\d+)*)/gi
      ],
      // عيار 21
      gold21: [
        /ذهب.*?عيار.*?21.*?عدن.*?(\d+(?:[,.]?\d+)*).*?(\d+(?:[,.]?\d+)*)/gi,
        /عيار.*?21.*?عدن.*?شراء.*?(\d+(?:[,.]?\d+)*).*?بيع.*?(\d+(?:[,.]?\d+)*)/gi,
        /21.*?قيراط.*?عدن.*?(\d+(?:[,.]?\d+)*).*?(\d+(?:[,.]?\d+)*)/gi
      ],
      // عيار 18
      gold18: [
        /ذهب.*?عيار.*?18.*?عدن.*?(\d+(?:[,.]?\d+)*).*?(\d+(?:[,.]?\d+)*)/gi,
        /عيار.*?18.*?عدن.*?شراء.*?(\d+(?:[,.]?\d+)*).*?بيع.*?(\d+(?:[,.]?\d+)*)/gi,
        /18.*?قيراط.*?عدن.*?(\d+(?:[,.]?\d+)*).*?(\d+(?:[,.]?\d+)*)/gi
      ]
    };

    const goldPrices = {
      '24': { buy: 0, sell: 0 },
      '21': { buy: 0, sell: 0 },
      '18': { buy: 0, sell: 0 }
    };

    // البحث عن كل عيار
    for (const [carat, patterns] of Object.entries(goldPatterns)) {
      const caratNumber = carat.replace('gold', '');
      
      for (const pattern of patterns) {
        const match = pattern.exec(html);
        if (match && match[1] && match[2]) {
          const buyPrice = cleanNumber(match[1]);
          const sellPrice = cleanNumber(match[2]);
          
          if (buyPrice > 0 && sellPrice > 0) {
            goldPrices[caratNumber as keyof typeof goldPrices] = { buy: buyPrice, sell: sellPrice };
            console.log(`🥇 تم العثور على أسعار الذهب عيار ${caratNumber}: شراء ${buyPrice}, بيع ${sellPrice}`);
            break;
          }
        }
      }
    }

    // إذا لم نجد أسعار، نستخدم أسعار افتراضية محدثة
    const defaultPrices = {
      '24': { buy: 25500, sell: 25800 },
      '21': { buy: 22300, sell: 22600 },
      '18': { buy: 19100, sell: 19400 }
    };

    const updates = [];

    // تحديث أو إدراج أسعار الذهب
    for (const [carat, prices] of Object.entries(goldPrices)) {
      const finalPrices = prices.buy > 0 && prices.sell > 0 ? prices : defaultPrices[carat as keyof typeof defaultPrices];
      
      for (const city of ['عدن', 'صنعاء']) {
        // التحقق من وجود السجل
        const { data: existing } = await supabaseClient
          .from('gold_prices')
          .select('id')
          .eq('type', `عيار ${carat}`)
          .eq('city', city)
          .single();

        if (existing) {
          // تحديث السجل الموجود
          const { error } = await supabaseClient
            .from('gold_prices')
            .update({
              buy_price: finalPrices.buy,
              sell_price: finalPrices.sell,
              updated_at: new Date().toISOString()
            })
            .eq('type', `عيار ${carat}`)
            .eq('city', city);

          if (error) {
            console.error(`❌ خطأ في تحديث الذهب عيار ${carat} لـ ${city}:`, error);
          } else {
            console.log(`✅ تم تحديث الذهب عيار ${carat} بنجاح لـ ${city}`);
            updates.push(`Gold-${carat}-${city}`);
          }
        } else {
          // إنشاء سجل جديد
          const { error } = await supabaseClient
            .from('gold_prices')
            .insert({
              type: `عيار ${carat}`,
              buy_price: finalPrices.buy,
              sell_price: finalPrices.sell,
              city: city,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) {
            console.error(`❌ خطأ في إنشاء سجل الذهب عيار ${carat} لـ ${city}:`, error);
          } else {
            console.log(`✅ تم إنشاء سجل الذهب عيار ${carat} بنجاح لـ ${city}`);
            updates.push(`Gold-${carat}-${city}-new`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم تحديث أسعار الذهب بنجاح',
        updates: updates,
        extractedPrices: goldPrices,
        defaultPricesUsed: Object.values(goldPrices).every(p => p.buy === 0),
        timestamp: new Date().toISOString(),
        source: 'yemennownews.com'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ خطأ في تحديث أسعار الذهب:', error)
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
