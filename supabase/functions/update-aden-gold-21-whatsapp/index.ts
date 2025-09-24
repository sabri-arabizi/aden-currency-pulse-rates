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

    console.log('🥇 بدء تحديث أسعار الذهب عيار 21 لعدن من موقع boqash.com')

    const body = await req.json().catch(() => ({}))
    
    // Default prices for 21-karat gold in Aden
    let goldPrice21 = {
      buy: 22300,
      sell: 22600
    }

    // If manual prices are provided in the request body, use them
    if (body.buy_price && body.sell_price) {
      goldPrice21.buy = parseFloat(body.buy_price)
      goldPrice21.sell = parseFloat(body.sell_price)
      console.log(`📝 تم استلام أسعار جديدة يدوياً: شراء ${goldPrice21.buy}, بيع ${goldPrice21.sell}`)
    } else {
      // Otherwise, fetch prices from boqash.com
      try {
        console.log('🌐 جاري جلب البيانات من موقع boqash.com...')
        const response = await fetch('https://boqash.com/prices-gold')
        const html = await response.text()
        
        // Clean number function for Arabic numbers and price formatting
        const cleanNumber = (text: string): number => {
          if (!text) return 0
          
          // Remove any non-numeric characters except commas and periods
          let cleaned = text.replace(/[^\d,\.]/g, '')
          
          // Remove commas (thousand separators)
          cleaned = cleaned.replace(/,/g, '')
          
          const num = parseFloat(cleaned)
          return isNaN(num) || num <= 0 ? 0 : Math.round(num)
        }

        // Look for the latest Aden gold 21 karat prices in the table
        const adenGold21Regex = /عيار 21.*?عدن.*?(\d+(?:,\d{3})*)\s*ريال.*?(\d+(?:,\d{3})*)\s*ريال.*?2025-09-04/s
        const match = html.match(adenGold21Regex)
        
        if (match) {
          const buyPrice = cleanNumber(match[1])
          const sellPrice = cleanNumber(match[2])
          
          if (buyPrice > 0 && sellPrice > 0) {
            goldPrice21.buy = buyPrice
            goldPrice21.sell = sellPrice
            console.log(`✅ تم استخراج أسعار الذهب من boqash.com: شراء ${buyPrice}, بيع ${sellPrice}`)
          } else {
            console.log('⚠️ لم يتم العثور على أسعار صحيحة في موقع boqash.com، استخدام الأسعار الافتراضية')
          }
        } else {
          console.log('⚠️ لم يتم العثور على بيانات أسعار الذهب في موقع boqash.com، استخدام الأسعار الافتراضية')
        }
        
      } catch (error) {
        console.error('❌ خطأ في جلب البيانات من موقع boqash.com:', error)
        console.log('📝 استخدام الأسعار الافتراضية بسبب خطأ في الشبكة')
      }
    }

    // Validate final prices
    const buyPrice = Math.round(goldPrice21.buy)
    const sellPrice = Math.round(goldPrice21.sell)

    if (buyPrice === 0 || sellPrice === 0) {
      throw new Error('أسعار غير صحيحة للذهب عيار 21')
    }

    // Check if record exists for 21-karat gold in Aden
    const { data: existing } = await supabaseClient
      .from('gold_prices')
      .select('id')
      .eq('type', 'عيار 21')
      .eq('city', 'عدن')
      .single()

    let updateResult

    if (existing) {
      // Update existing record
      const { error } = await supabaseClient
        .from('gold_prices')
        .update({
          buy_price: buyPrice,
          sell_price: sellPrice,
          updated_at: new Date().toISOString()
        })
        .eq('type', 'عيار 21')
        .eq('city', 'عدن')

      if (error) {
        console.error('❌ خطأ في تحديث الذهب عيار 21 لعدن:', error)
        throw error
      } else {
        console.log('✅ تم تحديث الذهب عيار 21 بنجاح لعدن')
        updateResult = 'updated'
      }
    } else {
      // Create new record
      const { error } = await supabaseClient
        .from('gold_prices')
        .insert({
          type: 'عيار 21',
          buy_price: buyPrice,
          sell_price: sellPrice,
          city: 'عدن',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ خطأ في إنشاء سجل الذهب عيار 21 لعدن:', error)
        throw error
      } else {
        console.log('✅ تم إنشاء سجل الذهب عيار 21 بنجاح لعدن')
        updateResult = 'created'
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم تحديث أسعار الذهب عيار 21 لعدن بنجاح',
        action: updateResult,
        prices: {
          buy_price: buyPrice,
          sell_price: sellPrice
        },
        timestamp: new Date().toISOString(),
        source: body.buy_price ? 'Manual Input' : 'boqash.com'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ خطأ في تحديث أسعار الذهب عيار 21 لعدن:', error)
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