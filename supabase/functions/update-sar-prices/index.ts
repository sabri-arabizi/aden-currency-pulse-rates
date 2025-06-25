
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

    // جلب البيانات من الموقع مع headers محسنة
    const response = await fetch('https://ye-rial.com/aden/', {
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
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    console.log('HTML fetched successfully, parsing currency prices...')

    // تحسين استخراج أسعار الريال السعودي مع دعم أرقام عربية وإنجليزية
    const sarPatterns = [
      /ريال\s*سعودي.*?شراء.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi,
      /سعودي.*?شراء.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi,
      /SAR.*?شراء.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi,
      /سار.*?شراء.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi
    ]

    const sarSellPatterns = [
      /ريال\s*سعودي.*?بيع.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi,
      /سعودي.*?بيع.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi,
      /SAR.*?بيع.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi,
      /سار.*?بيع.*?(\d{1,4}(?:[,.]?\d{1,4})*)/gi
    ]

    // تحسين استخراج أسعار الدولار الأمريكي مع دعم 4 خانات عشرية
    const usdPatterns = [
      /دولار\s*أمريكي.*?شراء.*?(\d{1,4}(?:[,.]?\d{1,4})*(?:\.\d{1,4})?)/gi,
      /دولار.*?شراء.*?(\d{1,4}(?:[,.]?\d{1,4})*(?:\.\d{1,4})?)/gi,
      /USD.*?شراء.*?(\d{1,4}(?:[,.]?\d{1,4})*(?:\.\d{1,4})?)/gi,
      /أمريكي.*?شراء.*?(\d{1,4}(?:[,.]?\d{1,4})*(?:\.\d{1,4})?)/gi
    ]

    const usdSellPatterns = [
      /دولار\s*أمريكي.*?بيع.*?(\d{1,4}(?:[,.]?\d{1,4})*(?:\.\d{1,4})?)/gi,
      /دولار.*?بيع.*?(\d{1,4}(?:[,.]?\d{1,4})*(?:\.\d{1,4})?)/gi,
      /USD.*?بيع.*?(\d{1,4}(?:[,.]?\d{1,4})*(?:\.\d{1,4})?)/gi,
      /أمريكي.*?بيع.*?(\d{1,4}(?:[,.]?\d{1,4})*(?:\.\d{1,4})?)/gi
    ]

    // دالة لتنظيف الأرقام وتحويلها
    const cleanNumber = (numStr: string): number => {
      // إزالة الفواصل وتحويل الفاصلة العربية إلى نقطة
      const cleaned = numStr.replace(/,/g, '').replace(/٫/g, '.').trim()
      return parseFloat(cleaned)
    }

    // دالة للبحث عن السعر باستخدام عدة patterns
    const findPrice = (patterns: RegExp[], html: string): number | null => {
      for (const pattern of patterns) {
        const match = pattern.exec(html)
        if (match && match[1]) {
          const price = cleanNumber(match[1])
          if (!isNaN(price) && price > 0) {
            return price
          }
        }
      }
      return null
    }

    const sarBuyPrice = findPrice(sarPatterns, html)
    const sarSellPrice = findPrice(sarSellPatterns, html)
    const usdBuyPrice = findPrice(usdPatterns, html)
    const usdSellPrice = findPrice(usdSellPatterns, html)

    console.log(`Extracted prices - SAR Buy: ${sarBuyPrice}, SAR Sell: ${sarSellPrice}`)
    console.log(`Extracted prices - USD Buy: ${usdBuyPrice}, USD Sell: ${usdSellPrice}`)

    const updates = []

    // تحديث الريال السعودي
    if (sarBuyPrice && sarSellPrice) {
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
    } else {
      console.log('SAR prices not found or invalid')
    }

    // تحديث الدولار الأمريكي
    if (usdBuyPrice && usdSellPrice) {
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
    } else {
      console.log('USD prices not found or invalid')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SAR and USD prices updated successfully',
        updates: updates,
        extractedPrices: {
          SAR: { buy: sarBuyPrice, sell: sarSellPrice },
          USD: { buy: usdBuyPrice, sell: usdSellPrice }
        },
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in SAR and USD price update:', error)
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
