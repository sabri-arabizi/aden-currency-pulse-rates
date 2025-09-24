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

    console.log('🥇 بدء تحديث جميع أسعار الذهب لعدن من مصادر متعددة')

    const body = await req.json().catch(() => ({}))
    
    // Default prices for all gold types in Aden
    let goldPrices: Record<string, { buy: number, sell: number }> = {
      'عيار 24': { buy: 24500, sell: 25000 },
      'عيار 22': { buy: 22400, sell: 22900 },
      'عيار 21': { buy: 21100, sell: 21600 },
      'عيار 18': { buy: 18300, sell: 18800 },
      'جنيه': { buy: 170000, sell: 175000 }
    }

    // If manual prices are provided in the request body, use them
    if (body.prices && typeof body.prices === 'object') {
      Object.keys(body.prices).forEach(type => {
        if (goldPrices[type] && body.prices[type].buy && body.prices[type].sell) {
          goldPrices[type].buy = parseFloat(body.prices[type].buy)
          goldPrices[type].sell = parseFloat(body.prices[type].sell)
          console.log(`📝 تم استلام أسعار يدوية لـ ${type}: شراء ${goldPrices[type].buy}, بيع ${goldPrices[type].sell}`)
        }
      })
    } else {
      // Try to fetch prices from boqash.com
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

        // Look for the latest Aden gold prices in the table for current date
        const currentDate = '2025-09-04'
        
        // Patterns for different gold types
        const goldPatterns = [
          { type: 'عيار 21', pattern: new RegExp(`عيار 21.*?عدن.*?(\\d+(?:,\\d{3})*)\\s*ريال.*?(\\d+(?:,\\d{3})*)\\s*ريال.*?${currentDate}`, 's') },
          { type: 'جنيه', pattern: new RegExp(`جنيه.*?عدن.*?(\\d+(?:,\\d{3})*)\\s*ريال.*?(\\d+(?:,\\d{3})*)\\s*ريال.*?${currentDate}`, 's') }
        ]
        
        let foundPrices = false
        
        for (const goldPattern of goldPatterns) {
          const match = html.match(goldPattern.pattern)
          
          if (match) {
            const buyPrice = cleanNumber(match[1])
            const sellPrice = cleanNumber(match[2])
            
            if (buyPrice > 0 && sellPrice > 0) {
              goldPrices[goldPattern.type] = { buy: buyPrice, sell: sellPrice }
              console.log(`✅ تم استخراج أسعار ${goldPattern.type} من boqash.com: شراء ${buyPrice}, بيع ${sellPrice}`)
              foundPrices = true
            }
          }
        }
        
        if (!foundPrices) {
          console.log('⚠️ لم يتم العثور على أسعار محدثة في موقع boqash.com، استخدام الأسعار الافتراضية')
        }
        
      } catch (error) {
        console.error('❌ خطأ في جلب البيانات من موقع boqash.com:', error)
        console.log('📝 استخدام الأسعار الافتراضية بسبب خطأ في الشبكة')
      }

      // Try to get other karats from alternative sources if needed
      try {
        console.log('🌐 محاولة جلب عيارات أخرى من مصادر إضافية...')
        
        // Calculate 18, 22, 24 karat prices based on 21 karat if available
        if (goldPrices['عيار 21'].buy > 1000) {
          const karat21Buy = goldPrices['عيار 21'].buy
          const karat21Sell = goldPrices['عيار 21'].sell
          
          // Calculate other karats based on gold purity ratios
          goldPrices['عيار 18'] = {
            buy: Math.round(karat21Buy * (18/21)),
            sell: Math.round(karat21Sell * (18/21))
          }
          
          goldPrices['عيار 22'] = {
            buy: Math.round(karat21Buy * (22/21)),
            sell: Math.round(karat21Sell * (22/21))
          }
          
          goldPrices['عيار 24'] = {
            buy: Math.round(karat21Buy * (24/21)),
            sell: Math.round(karat21Sell * (24/21))
          }
          
          console.log('✅ تم حساب أسعار العيارات الأخرى بناءً على عيار 21')
        }
        
      } catch (error) {
        console.error('❌ خطأ في حساب أسعار العيارات الإضافية:', error)
      }
    }

    // Update or insert all gold prices
    const updateResults = []
    
    for (const [goldType, prices] of Object.entries(goldPrices)) {
      try {
        // Validate prices
        const buyPrice = Math.round(prices.buy)
        const sellPrice = Math.round(prices.sell)

        if (buyPrice === 0 || sellPrice === 0) {
          console.log(`⚠️ أسعار غير صحيحة لـ ${goldType}، تجاهل التحديث`)
          continue
        }

        // Check if record exists
        const { data: existing } = await supabaseClient
          .from('gold_prices')
          .select('id')
          .eq('type', goldType)
          .eq('city', 'عدن')
          .single()

        if (existing) {
          // Update existing record
          const { error } = await supabaseClient
            .from('gold_prices')
            .update({
              buy_price: buyPrice,
              sell_price: sellPrice,
              updated_at: new Date().toISOString()
            })
            .eq('type', goldType)
            .eq('city', 'عدن')

          if (error) {
            console.error(`❌ خطأ في تحديث ${goldType} لعدن:`, error)
          } else {
            console.log(`✅ تم تحديث ${goldType} بنجاح لعدن`)
            updateResults.push({ type: goldType, action: 'updated', buy: buyPrice, sell: sellPrice })
          }
        } else {
          // Create new record
          const { error } = await supabaseClient
            .from('gold_prices')
            .insert({
              type: goldType,
              buy_price: buyPrice,
              sell_price: sellPrice,
              city: 'عدن',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (error) {
            console.error(`❌ خطأ في إنشاء سجل ${goldType} لعدن:`, error)
          } else {
            console.log(`✅ تم إنشاء سجل ${goldType} بنجاح لعدن`)
            updateResults.push({ type: goldType, action: 'created', buy: buyPrice, sell: sellPrice })
          }
        }
      } catch (error) {
        console.error(`❌ خطأ في معالجة ${goldType}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم تحديث أسعار الذهب لعدن بنجاح',
        results: updateResults,
        timestamp: new Date().toISOString(),
        source: body.prices ? 'Manual Input' : 'boqash.com + calculations'
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