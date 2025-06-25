
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

    console.log('Starting EGP price update from khbr.me')

    // جلب البيانات من الموقع
    const response = await fetch('https://www.khbr.me/rate.html')
    const html = await response.text()

    console.log('Fetched HTML content from khbr.me')

    // استخراج أسعار الجنيه المصري
    // البحث عن نمط يحتوي على "جنيه مصري" أو "مصري" مع أسعار الشراء والبيع
    const egpBuyMatch = html.match(/(?:جنيه\s*مصري|مصري).*?شراء.*?(\d+(?:,\d+)*(?:\.\d+)?)/i) ||
                       html.match(/مصر.*?شراء.*?(\d+(?:,\d+)*(?:\.\d+)?)/i)
    
    const egpSellMatch = html.match(/(?:جنيه\s*مصري|مصري).*?بيع.*?(\d+(?:,\d+)*(?:\.\d+)?)/i) ||
                        html.match(/مصر.*?بيع.*?(\d+(?:,\d+)*(?:\.\d+)?)/i)

    if (egpBuyMatch && egpSellMatch) {
      const egpBuyPrice = parseFloat(egpBuyMatch[1].replace(/,/g, ''))
      const egpSellPrice = parseFloat(egpSellMatch[1].replace(/,/g, ''))

      console.log(`EGP Prices found - Buy: ${egpBuyPrice}, Sell: ${egpSellPrice}`)

      const updates = []

      // تحديث الجنيه المصري لكلا المدينتين
      for (const city of ['عدن', 'صنعاء']) {
        const { error } = await supabaseClient
          .from('exchange_rates')
          .update({
            buy_price: egpBuyPrice,
            sell_price: egpSellPrice,
            updated_at: new Date().toISOString()
          })
          .eq('currency_code', 'EGP')
          .eq('city', city)

        if (error) {
          console.error(`Error updating EGP for ${city}:`, error)
        } else {
          console.log(`EGP updated successfully for ${city}`)
          updates.push(`EGP-${city}`)
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'EGP prices updated successfully',
          updates: updates,
          prices: { buy: egpBuyPrice, sell: egpSellPrice },
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      console.log('EGP prices not found in the HTML content')
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'EGP prices not found on the website',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

  } catch (error) {
    console.error('Error in EGP price update:', error)
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
