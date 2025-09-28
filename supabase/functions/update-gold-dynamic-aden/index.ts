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

    console.log('🥇 بدء التحديث الديناميكي لأسعار الذهب في عدن بناءً على أسعار الصرف')

    // الحصول على أسعار الصرف الحالية لعدن
    const { data: exchangeRates, error: exchangeError } = await supabaseClient
      .from('exchange_rates')
      .select('currency_code, buy_price, sell_price')
      .eq('city', 'عدن')

    if (exchangeError) {
      console.error('❌ خطأ في جلب أسعار الصرف:', exchangeError)
      throw exchangeError
    }

    console.log('📊 أسعار الصرف الحالية:', exchangeRates)

    // العثور على سعر الريال السعودي
    const sarRate = exchangeRates?.find(rate => rate.currency_code === 'SAR')
    
    if (!sarRate) {
      throw new Error('لم يتم العثور على سعر الريال السعودي')
    }

    console.log(`💰 سعر الريال السعودي: شراء ${sarRate.buy_price}, بيع ${sarRate.sell_price}`)

    // الأسعار الأساسية للذهب بالريال السعودي (من السوق العالمي)
    const goldBasePrices = {
      '24': 453.75, // ريال سعودي للجرام
      '22': 415.75,
      '21': 397.00,
      '18': 340.25
    }

    const updates = []
    const calculatedPrices = []

    // حساب وتحديث أسعار كل عيار
    for (const [carat, basePriceSAR] of Object.entries(goldBasePrices)) {
      // تحويل السعر من الريال السعودي إلى الريال اليمني
      const buyPriceYER = Math.round(basePriceSAR * sarRate.buy_price)
      const sellPriceYER = Math.round(basePriceSAR * sarRate.sell_price)

      console.log(`💰 حساب عيار ${carat}: ${basePriceSAR} ريال سعودي = شراء ${buyPriceYER}, بيع ${sellPriceYER} ريال يمني`)

      calculatedPrices.push({
        carat: `عيار ${carat}`,
        basePriceSAR,
        buyPriceYER,
        sellPriceYER,
        sarBuyRate: sarRate.buy_price,
        sarSellRate: sarRate.sell_price
      })

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
            buy_price: buyPriceYER,
            sell_price: sellPriceYER,
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
            buy_price: buyPriceYER,
            sell_price: sellPriceYER,
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم تحديث أسعار الذهب في عدن بناءً على أسعار الصرف',
        updates: updates,
        calculatedPrices: calculatedPrices,
        exchangeRates: {
          SAR: sarRate
        },
        formula: 'السعر الأساسي (ريال سعودي) × سعر صرف الريال السعودي',
        timestamp: new Date().toISOString(),
        source: 'تحديث ديناميكي بناءً على أسعار الصرف'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ خطأ في التحديث الديناميكي لأسعار الذهب:', error)
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