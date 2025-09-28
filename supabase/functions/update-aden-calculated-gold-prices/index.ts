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

    console.log('🥇 بدء تحديث أسعار الذهب المحسوبة لعدن')

    // الأسعار الأساسية لكل عيار
    const basePrices = {
      '24': 453.75,
      '22': 415.75,
      '21': 397.00,
      '18': 340.25
    }

    // معاملات الضرب لحساب أسعار الشراء والبيع
    const buyMultiplier = 425
    const sellMultiplier = 428

    const updates = []

    // حساب وتحديث أسعار كل عيار
    for (const [carat, basePrice] of Object.entries(basePrices)) {
      // حساب أسعار الشراء والبيع
      const buyPrice = Math.round(basePrice * buyMultiplier)
      const sellPrice = Math.round(basePrice * sellMultiplier)

      console.log(`💰 حساب أسعار عيار ${carat}: الأساسي ${basePrice}, شراء ${buyPrice}, بيع ${sellPrice}`)

      // التحقق من وجود السجل
      const { data: existing } = await supabaseClient
        .from('gold_prices')
        .select('id')
        .eq('type', `عيار ${carat}`)
        .eq('city', 'عدن')
        .single()

      if (existing) {
        // تحديث السجل الموجود
        const { error } = await supabaseClient
          .from('gold_prices')
          .update({
            buy_price: buyPrice,
            sell_price: sellPrice,
            updated_at: new Date().toISOString()
          })
          .eq('type', `عيار ${carat}`)
          .eq('city', 'عدن')

        if (error) {
          console.error(`❌ خطأ في تحديث عيار ${carat}:`, error)
          throw error
        } else {
          console.log(`✅ تم تحديث عيار ${carat} بنجاح`)
          updates.push(`Gold-${carat}-عدن-updated`)
        }
      } else {
        // إنشاء سجل جديد
        const { error } = await supabaseClient
          .from('gold_prices')
          .insert({
            type: `عيار ${carat}`,
            buy_price: buyPrice,
            sell_price: sellPrice,
            city: 'عدن',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error(`❌ خطأ في إنشاء سجل عيار ${carat}:`, error)
          throw error
        } else {
          console.log(`✅ تم إنشاء سجل عيار ${carat} بنجاح`)
          updates.push(`Gold-${carat}-عدن-created`)
        }
      }
    }

    // إنشاء جدول النتائج للعرض
    const calculatedPrices = Object.entries(basePrices).map(([carat, basePrice]) => ({
      carat: `عيار ${carat}`,
      basePrice,
      buyPrice: Math.round(basePrice * buyMultiplier),
      sellPrice: Math.round(basePrice * sellMultiplier)
    }))

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم تحديث أسعار الذهب المحسوبة لعدن بنجاح',
        updates: updates,
        calculatedPrices: calculatedPrices,
        calculation: {
          buyMultiplier,
          sellMultiplier,
          formula: 'السعر الأساسي × المعامل'
        },
        timestamp: new Date().toISOString(),
        source: 'حسابات مخصصة لسوق عدن'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ خطأ في تحديث أسعار الذهب المحسوبة:', error)
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