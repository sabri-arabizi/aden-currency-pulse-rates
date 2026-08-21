import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// دالة تنظيف الأرقام: إزالة الفواصل والمسافات ودعم الكسور العربية
const cleanNumber = (numStr: string): number => {
  if (!numStr) return 0;
  const cleaned = numStr
    .replace(/[,،\s]/g, '')
    .replace(/٫/g, '.')
    .trim();
  const number = parseFloat(cleaned);
  return isNaN(number) ? 0 : number;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔥 بدء تحديث سعر الجنيه المصري وفقاً لسوق عدن (khbr.me)')

    // المصدر موثوق: موقع وكالة خبر — يعرض قسماً مستقلاً لأسعار مدينة عدن
    const response = await fetch('https://www.khbr.me/rate.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    console.log('✅ تم جلب HTML من khbr.me')

    // تقسيم الصفحة إلى أقسام المدن — كل قسم داخل <div class="rates-section">
    const sections = html.split(/<div class="rates-section">/i).slice(1)

    // اختيار قسم مدينة عدن المباشر (<h2 class="city-name">عدن</h2>)
    // يلي قسم صنعاء مباشرةً، لذا نختار القسم الذي يحوي ترويسة عدن.
    const adenSection = sections.find(
      (seg) => /<h2 class="city-name">عدن<\/h2>/i.test(seg)
    ) || sections[sections.length - 1]

    if (!adenSection) {
      console.log('⚠️ لم يتم العثور على قسم عدن في صفحة khbr.me')
      return new Response(
        JSON.stringify({
          success: false,
          message: 'لم يتم العثور على قسم عدن',
          source: 'khbr.me',
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    console.log('📍 تم العثور على قسم عدن، جارٍ استخراج سعر الجنيه المصري...')

    // استخراج سطر الجنيه المصري من قسم عدن
    // بنية الجدول: اسم العملة ← <span class="price-value"> (سعر البيع) ← الاتجاه ← <span class="price-value"> (سعر الشراء)
    const egpRow = adenSection.match(
      /<span class="currency-name">جنيه مصري<\/span>[\s\S]*?<span class="price-value[^"]*">\s*([\d.,]+)\s*<\/span>[\s\S]*?<span class="price-value[^"]*">\s*([\d.,]+)\s*<\/span>/i
    )

    if (!egpRow) {
      console.log('⚠️ لم يتم العثور على سعر الجنيه المصري في قسم عدن')
      return new Response(
        JSON.stringify({
          success: false,
          message: 'لم يتم العثور على سعر الجنيه المصري في قسم عدن',
          source: 'khbr.me',
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const sellPrice = cleanNumber(egpRow[1])
    const buyPrice = cleanNumber(egpRow[2])

    // في جدول khbr.me العمود الأول هو "سعر البيع" والثاني "سعر الشراء"،
    // لكن نضمن منطقياً أن البيع هو الأعلى وأن الشراء هو الأدنى.
    const finalSell = Math.max(sellPrice, buyPrice)
    const finalBuy = Math.min(sellPrice, buyPrice)

    console.log(`💰 سعر الجنيه المصري في عدن - شراء: ${finalBuy}, بيع: ${finalSell}`)

    if (!(finalBuy > 0 && finalSell > 0 && finalSell < 200 && finalBuy < 200)) {
      throw new Error('الأسعار المستخرجة غير صحيحة أو خارج النطاق المتوقع')
    }

    // تحديث سعر الجنيه المصري لجميع المدن وفقاً لسوق مدينة عدن
    // (بحيث يتطابق سعر الجنبيه المصري المعروض مع سعره في سوق عدن)
    const { error } = await supabaseClient
      .from('exchange_rates')
      .update({
        buy_price: finalBuy,
        sell_price: finalSell,
        updated_at: new Date().toISOString()
      })
      .eq('currency_code', 'EGP')

    if (error) {
      throw new Error(`فشل تحديث سعر الجنيه المصري: ${error.message}`)
    }

    console.log('✅ تم تحديث سعر الجنيه المصري لجميع المدن وفقاً لسوق عدن بنجاح')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم تحديث سعر الجنيه المصري لجميع المدن وفقاً لسوق عدن',
        updates: ['EGP - جميع المدن (سوق عدن)'],
        prices: { buy: finalBuy, sell: finalSell },
        source: 'khbr.me (Aden)',
        version: '4.0 - Aden Market (All cities)',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ خطأ في تحديث سعر الجنيه المصري (عدن):', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'khbr.me (Aden)',
        version: '3.0 - Aden Market',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})