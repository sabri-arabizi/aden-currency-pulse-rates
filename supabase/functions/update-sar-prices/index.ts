
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

    console.log('Starting SAR and USD price update from ye-rial.com/aden')

    // جلب البيانات من الموقع
    const response = await fetch('https://ye-rial.com/aden/')
    const html = await response.text()

    console.log('Fetched HTML content from ye-rial.com/aden')

    // استخراج أسعار الريال السعودي
    const sarBuyMatch = html.match(/ريال\s*سعودي.*?شراء.*?(\d+(?:,\d+)*(?:\.\d+)?)/i)
    const sarSellMatch = html.match(/ريال\s*سعودي.*?بيع.*?(\d+(?:,\d+)*(?:\.\d+)?)/i)

    // استخراج أسعار الدولار الأمريكي
    const usdBuyMatch = html.match(/دولار.*?شراء.*?(\d+(?:,\d+)*(?:\.\d+)?)/i)
    const usdSellMatch = html.match(/دولار.*?بيع.*?(\d+(?:,\d+)*(?:\.\d+)?)/i)

    const updates = []

    // تحديث الريال السعودي
    if (sarBuyMatch && sarSellMatch) {
      const sarBuyPrice = parseFloat(sarBuyMatch[1].replace(/,/g, ''))
      const sarSellPrice = parseFloat(sarSellMatch[1].replace(/,/g, ''))

      console.log(`SAR Prices found - Buy: ${sarBuyPrice}, Sell: ${sarSellPrice}`)

      for (const city of ['عدن', 'صنعاء']) {
        const { error } = await supabaseClient
          .from('exchange_rates')
          .update({
            buy_price: sarBuyPrice,
            sell_price: sarSellPrice,
            updated_at: new Date().toISOString()
          })
          .eq('currency_code', 'SAR')
          .eq('city', city)

        if (error) {
          console.error(`Error updating SAR for ${city}:`, error)
        } else {
          console.log(`SAR updated successfully for ${city}`)
          updates.push(`SAR-${city}`)
        }
      }
    }

    // تحديث الدولار الأمريكي
    if (usdBuyMatch && usdSellMatch) {
      const usdBuyPrice = parseFloat(usdBuyMatch[1].replace(/,/g, ''))
      const usdSellPrice = parseFloat(usdSellMatch[1].replace(/,/g, ''))

      console.log(`USD Prices found - Buy: ${usdBuyPrice}, Sell: ${usdSellPrice}`)

      for (const city of ['عدن', 'صنعاء']) {
        const { error } = await supabaseClient
          .from('exchange_rates')
          .update({
            buy_price: usdBuyPrice,
            sell_price: usdSellPrice,
            updated_at: new Date().toISOString()
          })
          .eq('currency_code', 'USD')
          .eq('city', city)

        if (error) {
          console.error(`Error updating USD for ${city}:`, error)
        } else {
          console.log(`USD updated successfully for ${city}`)
          updates.push(`USD-${city}`)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SAR and USD prices updated successfully',
        updates: updates,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in SAR price update:', error)
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
