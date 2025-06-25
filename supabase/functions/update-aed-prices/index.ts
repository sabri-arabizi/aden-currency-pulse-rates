
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

    console.log('Fetching AED prices from almashhadalaraby.com')
    
    // البحث في عدة صفحات للعثور على أحدث أسعار الدرهم
    const searchUrls = [
      'https://almashhadalaraby.com/news/',
      'https://almashhadalaraby.com/news/514858',
      'https://almashhadalaraby.com/news/432500'
    ]

    let aedBuyPrice: number | null = null
    let aedSellPrice: number | null = null
    let sourceUrl = ''

    // دالة لتنظيف الأرقام
    const cleanNumber = (numStr: string): number => {
      const cleaned = numStr.replace(/,/g, '').replace(/٫/g, '.').trim()
      return parseFloat(cleaned)
    }

    // دالة للبحث عن أسعار الدرهم في النص
    const extractAEDPrices = (html: string) => {
      // patterns محسنة للبحث عن أسعار الدرهم الإماراتي
      const aedPatterns = {
        buy: [
          /درهم\s*إمارات.*?شراء.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi,
          /إمارات.*?شراء.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi,
          /AED.*?شراء.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi,
          /الدرهم\s*الإماراتي.*?شراء.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi,
          /إماراتي.*?شراء.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi
        ],
        sell: [
          /درهم\s*إمارات.*?بيع.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi,
          /إمارات.*?بيع.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi,
          /AED.*?بيع.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi,
          /الدرهم\s*الإماراتي.*?بيع.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi,
          /إماراتي.*?بيع.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi
        ]
      }

      // البحث عن سعر الشراء
      for (const pattern of aedPatterns.buy) {
        const match = pattern.exec(html)
        if (match && match[1]) {
          const price = cleanNumber(match[1])
          if (!isNaN(price) && price > 0 && price < 1000) {
            return { buy: price }
          }
        }
      }

      // البحث عن سعر البيع
      for (const pattern of aedPatterns.sell) {
        const match = pattern.exec(html)
        if (match && match[1]) {
          const price = cleanNumber(match[1])
          if (!isNaN(price) && price > 0 && price < 1000) {
            return { sell: price }
          }
        }
      }

      return null
    }

    // محاولة الحصول على الأسعار من المواقع المختلفة
    for (const url of searchUrls) {
      try {
        console.log(`Trying to fetch AED prices from: ${url}`)
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ar,en-US;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        })
        
        if (!response.ok) {
          console.log(`Failed to fetch ${url}: ${response.status}`)
          continue
        }
        
        const html = await response.text()
        console.log(`Successfully fetched HTML from ${url}, parsing AED prices...`)
        
        const prices = extractAEDPrices(html)
        
        if (prices?.buy || prices?.sell) {
          aedBuyPrice = prices.buy || null
          aedSellPrice = prices.sell || null
          sourceUrl = url
          console.log(`Found AED prices from ${url} - Buy: ${aedBuyPrice}, Sell: ${aedSellPrice}`)
          break
        }
        
      } catch (error) {
        console.log(`Error fetching from ${url}:`, error.message)
        continue
      }
    }

    // إذا لم يتم العثور على أسعار، استخدم أسعار افتراضية محسوبة من الدولار
    if (!aedBuyPrice && !aedSellPrice) {
      console.log('No AED prices found from sources, calculating from USD rates...')
      
      // الحصول على سعر الدولار الحالي من قاعدة البيانات
      const { data: usdData } = await supabaseClient
        .from('exchange_rates')
        .select('buy_price, sell_price')
        .eq('currency_code', 'USD')
        .eq('city', 'عدن')
        .single()
      
      if (usdData) {
        // الدرهم إلى الدولار تقريباً 3.67، لذلك الدرهم إلى الريال = الدولار إلى الريال / 3.67
        aedBuyPrice = Math.round((usdData.buy_price / 3.67) * 100) / 100
        aedSellPrice = Math.round((usdData.sell_price / 3.67) * 100) / 100
        sourceUrl = 'calculated from USD rates'
      } else {
        // أسعار افتراضية
        aedBuyPrice = 690.0
        aedSellPrice = 694.0
        sourceUrl = 'default values'
      }
    }

    // إذا تم العثور على سعر واحد فقط، احسب الآخر
    if (aedBuyPrice && !aedSellPrice) {
      aedSellPrice = aedBuyPrice + 4
    } else if (aedSellPrice && !aedBuyPrice) {
      aedBuyPrice = aedSellPrice - 4
    }
    
    console.log(`Final AED prices - Buy: ${aedBuyPrice}, Sell: ${aedSellPrice} from ${sourceUrl}`)
    
    // تحديث قاعدة البيانات لكلا المدينتين
    const cities = ['عدن', 'صنعاء']
    const updates = []
    
    for (const city of cities) {
      const { error } = await supabaseClient
        .from('exchange_rates')
        .update({
          buy_price: aedBuyPrice,
          sell_price: aedSellPrice,
          updated_at: new Date().toISOString()
        })
        .eq('currency_code', 'AED')
        .eq('city', city)
      
      if (error) {
        console.error(`Error updating AED for ${city}:`, error)
      } else {
        console.log(`Successfully updated AED prices for ${city}`)
        updates.push(`AED-${city}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'AED prices updated successfully',
        prices: { buy: aedBuyPrice, sell: aedSellPrice },
        source: sourceUrl,
        updates: updates,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error updating AED prices:', error)
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
