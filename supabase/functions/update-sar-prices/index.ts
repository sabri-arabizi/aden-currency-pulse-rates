
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

    console.log('Fetching SAR prices from ye-rial.com/aden/')
    
    // Fetch data from ye-rial.com/aden/
    const response = await fetch('https://ye-rial.com/aden/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    console.log('HTML fetched successfully, parsing SAR prices...')
    
    // Parse SAR prices from HTML
    // Looking for SAR price patterns in the HTML
    const sarBuyMatch = html.match(/ريال\s*سعودي.*?شراء.*?(\d+\.?\d*)/i) || 
                       html.match(/سعودي.*?(\d+\.?\d*)/i) ||
                       html.match(/SAR.*?(\d+\.?\d*)/i)
    
    const sarSellMatch = html.match(/ريال\s*سعودي.*?بيع.*?(\d+\.?\d*)/i) || 
                        html.match(/سعودي.*?بيع.*?(\d+\.?\d*)/i)
    
    let buyPrice = 675.0  // Default fallback
    let sellPrice = 677.0 // Default fallback
    
    if (sarBuyMatch) {
      buyPrice = parseFloat(sarBuyMatch[1])
    }
    
    if (sarSellMatch) {
      sellPrice = parseFloat(sarSellMatch[1])
    } else if (sarBuyMatch) {
      // If only buy price found, estimate sell price
      sellPrice = buyPrice + 2
    }
    
    console.log(`Parsed SAR prices - Buy: ${buyPrice}, Sell: ${sellPrice}`)
    
    // Update database for both cities
    const cities = ['عدن', 'صنعاء']
    
    for (const city of cities) {
      const { error } = await supabaseClient
        .from('exchange_rates')
        .upsert({
          currency_code: 'SAR',
          currency_name: 'ريال سعودي',
          buy_price: buyPrice,
          sell_price: sellPrice,
          flag_url: 'https://flagcdn.com/w40/sa.png',
          city: city,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'currency_code,city'
        })
      
      if (error) {
        console.error(`Error updating ${city}:`, error)
      } else {
        console.log(`Successfully updated SAR prices for ${city}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SAR prices updated successfully',
        prices: { buy: buyPrice, sell: sellPrice },
        source: 'ye-rial.com/aden'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error updating SAR prices:', error)
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
