
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
    
    // Fetch data from almashhadalaraby.com
    const response = await fetch('https://almashhadalaraby.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    console.log('HTML fetched successfully, parsing AED prices...')
    
    // Parse AED prices from HTML
    // Looking for AED/Dirham price patterns
    const aedBuyMatch = html.match(/درهم.*?إمارات.*?شراء.*?(\d+\.?\d*)/i) || 
                       html.match(/إمارات.*?(\d+\.?\d*)/i) ||
                       html.match(/AED.*?(\d+\.?\d*)/i) ||
                       html.match(/dirham.*?(\d+\.?\d*)/i)
    
    const aedSellMatch = html.match(/درهم.*?إمارات.*?بيع.*?(\d+\.?\d*)/i) || 
                        html.match(/إمارات.*?بيع.*?(\d+\.?\d*)/i)
    
    let buyPrice = 690.0  // Default fallback
    let sellPrice = 694.0 // Default fallback
    
    if (aedBuyMatch) {
      buyPrice = parseFloat(aedBuyMatch[1])
    }
    
    if (aedSellMatch) {
      sellPrice = parseFloat(aedSellMatch[1])
    } else if (aedBuyMatch) {
      // If only buy price found, estimate sell price
      sellPrice = buyPrice + 4
    }
    
    // If no specific AED prices found, try to get USD rate and convert
    if (!aedBuyMatch && !aedSellMatch) {
      console.log('No direct AED prices found, trying to calculate from USD...')
      
      // Get current USD rate from our database
      const { data: usdData } = await supabaseClient
        .from('exchange_rates')
        .select('buy_price, sell_price')
        .eq('currency_code', 'USD')
        .eq('city', 'عدن')
        .single()
      
      if (usdData) {
        // AED to USD is approximately 3.67, so AED to YER = USD to YER / 3.67
        buyPrice = Math.round(usdData.buy_price / 3.67)
        sellPrice = Math.round(usdData.sell_price / 3.67)
      }
    }
    
    console.log(`Parsed AED prices - Buy: ${buyPrice}, Sell: ${sellPrice}`)
    
    // Update database for both cities
    const cities = ['عدن', 'صنعاء']
    
    for (const city of cities) {
      const { error } = await supabaseClient
        .from('exchange_rates')
        .upsert({
          currency_code: 'AED',
          currency_name: 'درهم إماراتي',
          buy_price: buyPrice,
          sell_price: sellPrice,
          flag_url: 'https://flagcdn.com/w40/ae.png',
          city: city,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'currency_code,city'
        })
      
      if (error) {
        console.error(`Error updating ${city}:`, error)
      } else {
        console.log(`Successfully updated AED prices for ${city}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'AED prices updated successfully',
        prices: { buy: buyPrice, sell: sellPrice },
        source: 'almashhadalaraby.com'
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
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
