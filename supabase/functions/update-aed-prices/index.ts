
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

    console.log('Fetching AED prices from 2dec.net')
    
    const targetUrl = 'https://2dec.net/rate.html'
    let aedBuyPrice: number | null = null
    let aedSellPrice: number | null = null
    let sourceUrl = ''

    // دالة لتنظيف الأرقام
    const cleanNumber = (numStr: string): number => {
      const cleaned = numStr.replace(/,/g, '').replace(/٫/g, '.').trim()
      return parseFloat(cleaned)
    }

    // دالة للبحث عن أسعار الدرهم الإماراتي من موقع 2dec
    const extractAEDPricesFrom2dec = (html: string) => {
      try {
        console.log('Parsing AED prices from 2dec.net...')
        
        // البحث عن قسم عدن أولاً
        const adenSectionMatch = html.match(/<td[^>]*>\s*عدن\s*<span[^>]*>[\s\S]*?<\/table>/i)
        if (!adenSectionMatch) {
          console.log('Could not find Aden section in HTML')
          return null
        }

        const adenSection = adenSectionMatch[0]
        console.log('Found Aden section, searching for AED prices...')

        // البحث عن سطر الدرهم الإماراتي في قسم عدن
        const aedRowMatch = adenSection.match(/<tr>[\s\S]*?درهم اماراتي[\s\S]*?<\/tr>/i)
        if (!aedRowMatch) {
          console.log('Could not find AED row in Aden section')
          return null
        }

        const aedRow = aedRowMatch[0]
        console.log('Found AED row:', aedRow.substring(0, 200) + '...')

        // استخراج أسعار البيع والشراء
        const priceMatches = aedRow.match(/<span[^>]*>([0-9,\.]+)<\/span>/g)
        if (!priceMatches || priceMatches.length < 2) {
          console.log('Could not find price spans in AED row')
          return null
        }

        // استخراج الأرقام من spans
        const prices = priceMatches.map(match => {
          const priceMatch = match.match(/([0-9,\.]+)/)
          return priceMatch ? cleanNumber(priceMatch[1]) : null
        }).filter(price => price !== null && price > 0)

        if (prices.length >= 2) {
          // في جدول 2dec: العمود الأول هو البيع، والثاني هو الشراء
          const sellPrice = Math.round(prices[0] || 0)  // بيع - إزالة الجزء العشري
          const buyPrice = Math.round(prices[1] || 0)   // شراء - إزالة الجزء العشري
          
          console.log(`Extracted AED prices - Sell: ${sellPrice}, Buy: ${buyPrice}`)
          
          if (sellPrice && buyPrice && sellPrice > 0 && buyPrice > 0 && sellPrice < 2000 && buyPrice < 2000) {
            return { buy: buyPrice, sell: sellPrice }
          }
        }

        console.log('Failed to extract valid AED prices from row')
        return null
        
      } catch (error) {
        console.error('Error parsing AED prices:', error)
        return null
      }
    }

    // محاولة الحصول على الأسعار من موقع 2dec
    try {
      console.log(`Fetching AED prices from: ${targetUrl}`)
      
      const response = await fetch(targetUrl, {
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const html = await response.text()
      console.log(`Successfully fetched HTML from ${targetUrl}, length: ${html.length}`)
      
      const prices = extractAEDPricesFrom2dec(html)
      
      if (prices?.buy && prices?.sell) {
        aedBuyPrice = prices.buy
        aedSellPrice = prices.sell
        sourceUrl = targetUrl
        console.log(`Successfully extracted AED prices - Buy: ${aedBuyPrice}, Sell: ${aedSellPrice}`)
      } else {
        throw new Error('Could not extract AED prices from 2dec.net')
      }
      
    } catch (error) {
      console.error(`Error fetching from ${targetUrl}:`, error instanceof Error ? error.message : 'Unknown error')
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
        aedBuyPrice = Math.round(usdData.buy_price / 3.67)
        aedSellPrice = Math.round(usdData.sell_price / 3.67)
        sourceUrl = 'calculated from USD rates'
      } else {
        // أسعار افتراضية
        aedBuyPrice = 690
        aedSellPrice = 694
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
    
    // تحديث قاعدة البيانات لعدن فقط (صنعاء لها أسعار ثابتة)
    const updates = []
    
    // تحديث عدن فقط
    const { error: adenError } = await supabaseClient
      .from('exchange_rates')
      .update({
        buy_price: aedBuyPrice,
        sell_price: aedSellPrice,
        updated_at: new Date().toISOString()
      })
      .eq('currency_code', 'AED')
      .eq('city', 'عدن')
    
    if (adenError) {
      console.error('Error updating AED for عدن:', adenError)
    } else {
      console.log('Successfully updated AED prices for عدن')
      updates.push('AED-عدن')
    }
    
    // صنعاء لها أسعار ثابتة (لا يتم تحديثها)
    console.log('ℹ️ أسعار الدرهم الإماراتي في صنعاء ثابتة ولا يتم تحديثها')
    console.log('ℹ️ أسعار الذهب في عدن يتم تحديثها يدوياً فقط من قبل المستخدم')

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
