
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

    console.log('🏛️ بدء تحديث أسعار الصرف لصنعاء من ye-rial.com')

    // استخدام نفس مصدر عدن مع تحديث المدينة لصنعاء
    const response = await fetch('https://ye-rial.com/aden', {
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
    console.log('✅ تم جلب HTML من ye-rial.com، بدء استخراج أسعار الصرف...')

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
      { code: 'SAR', name: 'ريال سعودي' },
      { code: 'USD', name: 'دولار أمريكي' },
      { code: 'AED', name: 'درهم إماراتي' },
      { code: 'EGP', name: 'جنيه مصري' }
    ];

    // معالجة كل عملة
    for (const currency of currencies) {
      // جلب أسعار عدن أولاً
      const { data: adenRate } = await supabaseClient
        .from('exchange_rates')
        .select('buy_price, sell_price')
        .eq('currency_code', currency.code)
        .eq('city', 'عدن')
        .single();

      if (adenRate) {
        // تحديث أو إنشاء السجل في صنعاء بنفس أسعار عدن
        const { error } = await supabaseClient
          .from('exchange_rates')
          .update({
            buy_price: adenRate.buy_price,
            sell_price: adenRate.sell_price,
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
        source: 'ye-rial.com (نفس أسعار عدن)'
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
