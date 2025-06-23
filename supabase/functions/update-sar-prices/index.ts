
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

    console.log('Fetching SAR and USD prices from ye-rial.com/aden/')
    
    // جلب البيانات من ye-rial.com/aden/
    const response = await fetch('https://ye-rial.com/aden/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    console.log('HTML fetched successfully, parsing currency prices...')
    
    // استخراج أسعار الريال السعودي
    const sarBuyMatch = html.match(/ريال\s*سعودي.*?شراء.*?(\d+\.?\d*)/i) || 
                       html.match(/سعودي.*?(\d+\.?\d*)/i) ||
                       html.match(/SAR.*?(\d+\.?\d*)/i)
    
    const sarSellMatch = html.match(/ريال\s*سعودي.*?بيع.*?(\d+\.?\d*)/i) || 
                        html.match(/سعودي.*?بيع.*?(\d+\.?\d*)/i)
    
    // استخراج أسعار الدولار الأمريكي
    const usdBuyMatch = html.match(/دولار.*?شراء.*?(\d+\.?\d*)/i) || 
                       html.match(/USD.*?(\d+\.?\d*)/i) ||
                       html.match(/أمريكي.*?(\d+\.?\d*)/i)
    
    const usdSellMatch = html.match(/دولار.*?بيع.*?(\d+\.?\d*)/i) || 
                        html.match(/أمريكي.*?بيع.*?(\d+\.?\d*)/i)
    
    // أسعار افتراضية في حالة عدم وجود البيانات
    let sarBuyPrice = 675.0
    let sarSellPrice = 677.0
    let usdBuyPrice = 2530.0
    let usdSellPrice = 2540.0
    
    if (sarBuyMatch) {
      sarBuyPrice = parseFloat(sarBuyMatch[1])
    }
    if (sarSellMatch) {
      sarSellPrice = parseFloat(sarSellMatch[1])
    } else if (sarBuyMatch) {
      sarSellPrice = sarBuyPrice + 2
    }
    
    if (usdBuyMatch) {
      usdBuyPrice = parseFloat(usdBuyMatch[1])
    }
    if (usdSellMatch) {
      usdSellPrice = parseFloat(usdSellMatch[1])
    } else if (usdBuyMatch) {
      usdSellPrice = usdBuyPrice + 10
    }
    
    console.log(`Parsed SAR prices - Buy: ${sarBuyPrice}, Sell: ${sarSellPrice}`)
    console.log(`Parsed USD prices - Buy: ${usdBuyPrice}, Sell: ${usdSellPrice}`)
    
    // تحديث قاعدة البيانات لكلا المدينتين
    const cities = ['عدن', 'صنعاء']
    
    for (const city of cities) {
      // تحديث الريال السعودي
      const { error: sarError } = await supabaseClient
        .from('exchange_rates')
        .upsert({
          currency_code: 'SAR',
          currency_name: 'ريال سعودي',
          buy_price: sarBuyPrice,
          sell_price: sarSellPrice,
          flag_url: 'https://flagcdn.com/w40/sa.png',
          city: city,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'currency_code,city'
        })
      
      // تحديث الدولار الأمريكي
      const { error: usdError } = await supabaseClient
        .from('exchange_rates')
        .upsert({
          currency_code: 'USD',
          currency_name: 'دولار أمريكي',
          buy_price: usdBuyPrice,
          sell_price: usdSellPrice,
          flag_url: 'https://flagcdn.com/w40/us.png',
          city: city,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'currency_code,city'
        })
      
      if (sarError) {
        console.error(`Error updating SAR for ${city}:`, sarError)
      } else {
        console.log(`Successfully updated SAR prices for ${city}`)
      }
      
      if (usdError) {
        console.error(`Error updating USD for ${city}:`, usdError)
      } else {
        console.log(`Successfully updated USD prices for ${city}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SAR and USD prices updated successfully',
        prices: { 
          sar: { buy: sarBuyPrice, sell: sarSellPrice },
          usd: { buy: usdBuyPrice, sell: usdSellPrice }
        },
        source: 'ye-rial.com/aden'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error updating SAR and USD prices:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
