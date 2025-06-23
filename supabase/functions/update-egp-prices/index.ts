
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

    console.log('Fetching EGP prices from khbr.me/rate.html')
    
    // جلب البيانات من khbr.me/rate.html
    const response = await fetch('https://www.khbr.me/rate.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    console.log('HTML fetched successfully, parsing EGP prices...')
    
    // استخراج أسعار الجنيه المصري
    const egpBuyMatch = html.match(/جنيه.*?مصري.*?شراء.*?(\d+\.?\d*)/i) || 
                       html.match(/مصري.*?(\d+\.?\d*)/i) ||
                       html.match(/EGP.*?(\d+\.?\d*)/i) ||
                       html.match(/egyptian.*?(\d+\.?\d*)/i)
    
    const egpSellMatch = html.match(/جنيه.*?مصري.*?بيع.*?(\d+\.?\d*)/i) || 
                        html.match(/مصري.*?بيع.*?(\d+\.?\d*)/i)
    
    let buyPrice = 50.0  // سعر افتراضي
    let sellPrice = 52.0 // سعر افتراضي
    
    if (egpBuyMatch) {
      buyPrice = parseFloat(egpBuyMatch[1])
    }
    
    if (egpSellMatch) {
      sellPrice = parseFloat(egpSellMatch[1])
    } else if (egpBuyMatch) {
      // إذا تم العثور على سعر الشراء فقط، نقدر سعر البيع
      sellPrice = buyPrice + 2
    }
    
    // إذا لم يتم العثور على أسعار محددة للجنيه، نحاول الحصول على سعر الدولار وتحويله
    if (!egpBuyMatch && !egpSellMatch) {
      console.log('No direct EGP prices found, trying to calculate from USD...')
      
      // الحصول على سعر الدولار الحالي من قاعدة البيانات
      const { data: usdData } = await supabaseClient
        .from('exchange_rates')
        .select('buy_price, sell_price')
        .eq('currency_code', 'USD')
        .eq('city', 'عدن')
        .single()
      
      if (usdData) {
        // الجنيه إلى الدولار تقريباً 0.02، لذلك الجنيه إلى الريال = الدولار إلى الريال * 0.02
        buyPrice = Math.round(usdData.buy_price * 0.02)
        sellPrice = Math.round(usdData.sell_price * 0.02)
      }
    }
    
    console.log(`Parsed EGP prices - Buy: ${buyPrice}, Sell: ${sellPrice}`)
    
    // تحديث قاعدة البيانات لكلا المدينتين
    const cities = ['عدن', 'صنعاء']
    
    for (const city of cities) {
      const { error } = await supabaseClient
        .from('exchange_rates')
        .upsert({
          currency_code: 'EGP',
          currency_name: 'جنيه مصري',
          buy_price: buyPrice,
          sell_price: sellPrice,
          flag_url: 'https://flagcdn.com/w40/eg.png',
          city: city,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'currency_code,city'
        })
      
      if (error) {
        console.error(`Error updating ${city}:`, error)
      } else {
        console.log(`Successfully updated EGP prices for ${city}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'EGP prices updated successfully',
        prices: { buy: buyPrice, sell: sellPrice },
        source: 'khbr.me/rate.html'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error updating EGP prices:', error)
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
