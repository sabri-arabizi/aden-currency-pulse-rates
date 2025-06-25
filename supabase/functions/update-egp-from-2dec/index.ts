
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

    console.log('بدء تحديث أسعار الجنيه المصري من 2dec.net')

    // جلب البيانات من الموقع الجديد مع headers محسنة
    const response = await fetch('https://2dec.net/rate.htm', {
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
    console.log('تم جلب HTML من 2dec.net بنجاح، جاري تحليل أسعار الجنيه المصري...')

    // تحسين استخراج أسعار الجنيه المصري مع دعم أرقام عربية وإنجليزية
    const egpBuyPatterns = [
      /جنيه\s*مصري.*?شراء.*?(\d{1,3}(?:[,.]?\d{1,3})*(?:\.\d{1,2})?)/gi,
      /مصري.*?شراء.*?(\d{1,3}(?:[,.]?\d{1,3})*(?:\.\d{1,2})?)/gi,
      /EGP.*?شراء.*?(\d{1,3}(?:[,.]?\d{1,3})*(?:\.\d{1,2})?)/gi,
      /مصر.*?شراء.*?(\d{1,3}(?:[,.]?\d{1,3})*(?:\.\d{1,2})?)/gi,
      /egypt.*?buy.*?(\d{1,3}(?:[,.]?\d{1,3})*(?:\.\d{1,2})?)/gi
    ]

    const egpSellPatterns = [
      /جنيه\s*مصري.*?بيع.*?(\d{1,3}(?:[,.]?\d{1,3})*(?:\.\d{1,2})?)/gi,
      /مصري.*?بيع.*?(\d{1,3}(?:[,.]?\d{1,3})*(?:\.\d{1,2})?)/gi,
      /EGP.*?بيع.*?(\d{1,3}(?:[,.]?\d{1,3})*(?:\.\d{1,2})?)/gi,
      /مصر.*?بيع.*?(\d{1,3}(?:[,.]?\d{1,3})*(?:\.\d{1,2})?)/gi,
      /egypt.*?sell.*?(\d{1,3}(?:[,.]?\d{1,3})*(?:\.\d{1,2})?)/gi
    ]

    // دالة لتنظيف الأرقام وتحويلها
    const cleanNumber = (numStr: string): number => {
      const cleaned = numStr.replace(/,/g, '').replace(/٫/g, '.').trim()
      return parseFloat(cleaned)
    }

    // دالة للبحث عن السعر باستخدام عدة patterns
    const findPrice = (patterns: RegExp[], html: string): number | null => {
      for (const pattern of patterns) {
        const matches = html.matchAll(pattern)
        for (const match of matches) {
          if (match && match[1]) {
            const price = cleanNumber(match[1])
            if (!isNaN(price) && price > 0 && price < 200) { // منطق للجنيه المصري
              return price
            }
          }
        }
      }
      return null
    }

    let egpBuyPrice = findPrice(egpBuyPatterns, html)
    let egpSellPrice = findPrice(egpSellPatterns, html)

    // إذا لم نجد الأسعار، نبحث في جدول HTML
    if (!egpBuyPrice || !egpSellPrice) {
      console.log('البحث في جداول HTML...')
      
      // البحث عن جداول تحتوي على أسعار الجنيه المصري
      const tablePattern = /<table[^>]*>[\s\S]*?<\/table>/gi
      const tableMatches = html.matchAll(tablePattern)
      
      for (const tableMatch of tableMatches) {
        const tableHtml = tableMatch[0]
        if (tableHtml.includes('مصري') || tableHtml.includes('EGP') || tableHtml.includes('egypt')) {
          console.log('وُجدت جدول يحتوي على بيانات الجنيه المصري')
          
          // استخراج الأرقام من الجدول
          const numberPattern = /(\d{1,3}(?:[,.]?\d{1,3})*(?:\.\d{1,2})?)/g
          const numbers = [...tableHtml.matchAll(numberPattern)]
            .map(match => cleanNumber(match[1]))
            .filter(num => !isNaN(num) && num > 50 && num < 200)
          
          if (numbers.length >= 2) {
            egpBuyPrice = Math.min(...numbers)
            egpSellPrice = Math.max(...numbers)
            console.log(`أسعار مستخرجة من الجدول - شراء: ${egpBuyPrice}, بيع: ${egpSellPrice}`)
            break
          }
        }
      }
    }

    console.log(`الأسعار المستخرجة - EGP شراء: ${egpBuyPrice}, EGP بيع: ${egpSellPrice}`)

    const updates = []

    if (egpBuyPrice && egpSellPrice) {
      console.log(`تم العثور على أسعار EGP - شراء: ${egpBuyPrice}, بيع: ${egpSellPrice}`)

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
          console.error(`خطأ في تحديث EGP لـ ${city}:`, error)
        } else {
          console.log(`تم تحديث EGP بنجاح لـ ${city}`)
          updates.push(`EGP-${city}`)
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'تم تحديث أسعار الجنيه المصري بنجاح من 2dec.net',
          updates: updates,
          prices: { buy: egpBuyPrice, sell: egpSellPrice },
          source: '2dec.net',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      console.log('لم يتم العثور على أسعار EGP في محتوى الصفحة')
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'لم يتم العثور على أسعار الجنيه المصري في الموقع',
          source: '2dec.net',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

  } catch (error) {
    console.error('خطأ في تحديث أسعار EGP من 2dec.net:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        source: '2dec.net',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
