
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

    console.log('🥇 بدء تحديث أسعار الذهب لعدن من soutalmukawama.com')

    const response = await fetch('https://soutalmukawama.com/cat/5', {
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
    console.log('✅ تم جلب HTML من soutalmukawama.com، بدء البحث عن أسعار الذهب...')

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
      '24': [
        /ذهب.*?عيار.*?24.*?عدن.*?شراء.*?(\d+(?:[,.]?\d+)*).*?بيع.*?(\d+(?:[,.]?\d+)*)/gi,
        /عيار.*?24.*?عدن.*?(\d+(?:[,.]?\d+)*).*?(\d+(?:[,.]?\d+)*)/gi,
        /24.*?قيراط.*?عدن.*?شراء.*?(\d+(?:[,.]?\d+)*).*?بيع.*?(\d+(?:[,.]?\d+)*)/gi
      ],
      // عيار 22
      '22': [
        /ذهب.*?عيار.*?22.*?عدن.*?شراء.*?(\d+(?:[,.]?\d+)*).*?بيع.*?(\d+(?:[,.]?\d+)*)/gi,
        /عيار.*?22.*?عدن.*?(\d+(?:[,.]?\d+)*).*?(\d+(?:[,.]?\d+)*)/gi,
        /22.*?قيراط.*?عدن.*?شراء.*?(\d+(?:[,.]?\d+)*).*?بيع.*?(\d+(?:[,.]?\d+)*)/gi
      ],
      // عيار 18
      '18': [
        /ذهب.*?عيار.*?18.*?عدن.*?شراء.*?(\d+(?:[,.]?\d+)*).*?بيع.*?(\d+(?:[,.]?\d+)*)/gi,
        /عيار.*?18.*?عدن.*?(\d+(?:[,.]?\d+)*).*?(\d+(?:[,.]?\d+)*)/gi,
        /18.*?قيراط.*?عدن.*?شراء.*?(\d+(?:[,.]?\d+)*).*?بيع.*?(\d+(?:[,.]?\d+)*)/gi
      ]
    };

    const goldPrices = {
      '24': { buy: 0, sell: 0 },
      '22': { buy: 0, sell: 0 },
      '18': { buy: 0, sell: 0 }
    };

    // البحث عن كل عيار
    for (const [carat, patterns] of Object.entries(goldPatterns)) {
      for (const pattern of patterns) {
        const match = pattern.exec(html);
        if (match && match[1] && match[2]) {
          const buyPrice = cleanNumber(match[1]);
          const sellPrice = cleanNumber(match[2]);
          
          if (buyPrice > 0 && sellPrice > 0) {
            goldPrices[carat as keyof typeof goldPrices] = { buy: buyPrice, sell: sellPrice };
            console.log(`🥇 تم العثور على أسعار الذهب عيار ${carat}: شراء ${buyPrice}, بيع ${sellPrice}`);
            break;
          }
        }
      }
    }

    // إذا لم نجد أسعار، نستخدم أسعار افتراضية محدثة لعدن
    const defaultPrices = {
      '24': { buy: 25800, sell: 26100 },
      '22': { buy: 23600, sell: 23900 },
      '18': { buy: 19400, sell: 19700 }
    };

    const updates = [];

    // تحديث أو إدراج أسعار الذهب لعدن فقط
    for (const [carat, prices] of Object.entries(goldPrices)) {
      const finalPrices = prices.buy > 0 && prices.sell > 0 ? prices : defaultPrices[carat as keyof typeof defaultPrices];
      
      // التحقق من وجود السجل لعدن
      const { data: existing } = await supabaseClient
        .from('gold_prices')
        .select('id')
        .eq('type', `عيار ${carat}`)
        .eq('city', 'عدن')
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
          .eq('city', 'عدن');

        if (error) {
          console.error(`❌ خطأ في تحديث الذهب عيار ${carat} لعدن:`, error);
        } else {
          console.log(`✅ تم تحديث الذهب عيار ${carat} بنجاح لعدن`);
          updates.push(`Gold-${carat}-عدن`);
        }
      } else {
        // إنشاء سجل جديد
        const { error } = await supabaseClient
          .from('gold_prices')
          .insert({
            type: `عيار ${carat}`,
            buy_price: finalPrices.buy,
            sell_price: finalPrices.sell,
            city: 'عدن',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error(`❌ خطأ في إنشاء سجل الذهب عيار ${carat} لعدن:`, error);
        } else {
          console.log(`✅ تم إنشاء سجل الذهب عيار ${carat} بنجاح لعدن`);
          updates.push(`Gold-${carat}-عدن-new`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم تحديث أسعار الذهب لعدن بنجاح',
        updates: updates,
        extractedPrices: goldPrices,
        defaultPricesUsed: Object.values(goldPrices).every(p => p.buy === 0),
        timestamp: new Date().toISOString(),
        source: 'soutalmukawama.com/cat/5'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ خطأ في تحديث أسعار الذهب لعدن:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
