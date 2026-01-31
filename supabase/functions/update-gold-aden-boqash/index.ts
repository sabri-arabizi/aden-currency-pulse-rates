import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 بدء تحديث أسعار الذهب في عدن من boqash.com...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch gold prices from boqash.com
    console.log('📊 جلب أسعار الذهب من boqash.com...');
    const response = await fetch('https://boqash.com/prices-gold/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar,en;q=0.5',
      }
    });

    if (!response.ok) {
      throw new Error(`فشل في جلب الصفحة: ${response.status}`);
    }

    const html = await response.text();
    console.log('✅ تم جلب HTML بنجاح، طول المحتوى:', html.length);

    // Extract prices from the HTML table
    // Format: <tr data-city="عدن" data-type="عيار 21">
    //   <td>عيار 21</td>
    //   <td>عدن</td>
    //   <td><span class="price-value">218,900 ريال</span></td>
    //   <td><span class="price-value">238,000 ريال</span></td>
    // </tr>
    
    const extractAdenPrices = (html: string): { 
      karat21Buy: number; 
      karat21Sell: number;
      poundBuy: number;
      poundSell: number;
    } | null => {
      // Pattern to match first Aden karat 21 row (most recent)
      // <tr data-city="عدن" data-type="عيار 21"...>...<span class="price-value">218,900 ريال</span>...<span class="price-value">238,000 ريال</span>
      
      const karat21Pattern = /<tr[^>]*data-city="عدن"[^>]*data-type="عيار 21"[^>]*>[\s\S]*?<span[^>]*class="price-value"[^>]*>([\d,]+)\s*ريال<\/span>[\s\S]*?<span[^>]*class="price-value"[^>]*>([\d,]+)\s*ريال<\/span>/i;
      
      const poundPattern = /<tr[^>]*data-city="عدن"[^>]*data-type="جنيه"[^>]*>[\s\S]*?<span[^>]*class="price-value"[^>]*>([\d,]+)\s*ريال<\/span>[\s\S]*?<span[^>]*class="price-value"[^>]*>([\d,]+)\s*ريال<\/span>/i;

      console.log('🔍 البحث عن عيار 21 في HTML...');
      const karat21Match = html.match(karat21Pattern);
      const poundMatch = html.match(poundPattern);

      if (karat21Match) {
        console.log('✅ تم العثور على عيار 21:', karat21Match[1], karat21Match[2]);
      } else {
        console.log('❌ لم يتم العثور على عيار 21 بالنمط الأول، جاري المحاولة بنمط بديل...');
        
        // Alternative pattern - look in markdown-style table
        const altPattern = /عيار\s*21[^|]*\|[^|]*عدن[^|]*\|[^▲▼●]*[▲▼●]\s*([\d,]+)[^|]*ريال[^|]*\|[^▲▼●]*[▲▼●]\s*([\d,]+)/;
        const altMatch = html.match(altPattern);
        
        if (altMatch) {
          console.log('✅ تم العثور بالنمط البديل:', altMatch[1], altMatch[2]);
          const karat21Buy = parseInt(altMatch[1].replace(/,/g, ''), 10);
          const karat21Sell = parseInt(altMatch[2].replace(/,/g, ''), 10);
          
          // Look for pound with similar pattern
          const poundAltPattern = /جنيه[^|]*\|[^|]*عدن[^|]*\|[^▲▼●]*[▲▼●]\s*([\d,]+)[^|]*ريال[^|]*\|[^▲▼●]*[▲▼●]\s*([\d,]+)/;
          const poundAltMatch = html.match(poundAltPattern);
          
          let poundBuy = 0;
          let poundSell = 0;
          if (poundAltMatch) {
            poundBuy = parseInt(poundAltMatch[1].replace(/,/g, ''), 10);
            poundSell = parseInt(poundAltMatch[2].replace(/,/g, ''), 10);
          }
          
          return { karat21Buy, karat21Sell, poundBuy, poundSell };
        }
        
        return null;
      }

      const karat21Buy = parseInt(karat21Match[1].replace(/,/g, ''), 10);
      const karat21Sell = parseInt(karat21Match[2].replace(/,/g, ''), 10);
      
      let poundBuy = 0;
      let poundSell = 0;
      
      if (poundMatch) {
        poundBuy = parseInt(poundMatch[1].replace(/,/g, ''), 10);
        poundSell = parseInt(poundMatch[2].replace(/,/g, ''), 10);
        console.log('✅ تم العثور على الجنيه:', poundBuy, poundSell);
      }

      if (!isNaN(karat21Buy) && !isNaN(karat21Sell) && karat21Buy > 0 && karat21Sell > 0) {
        return { karat21Buy, karat21Sell, poundBuy, poundSell };
      }
      
      return null;
    };

    const prices = extractAdenPrices(html);

    if (!prices) {
      throw new Error('فشل في استخراج أسعار عيار 21 من الموقع');
    }

    console.log('💰 الأسعار المستخرجة:', prices);

    // Calculate other karats based on karat 21
    // Gold karat formula: PriceX = Price21 * (X / 21)
    const calculateKaratPrice = (price21: number, karat: number): number => {
      return Math.round(price21 * (karat / 21));
    };

    const goldTypes = [
      { 
        type: 'عيار 18', 
        buyPrice: calculateKaratPrice(prices.karat21Buy, 18),
        sellPrice: calculateKaratPrice(prices.karat21Sell, 18)
      },
      { 
        type: 'عيار 21', 
        buyPrice: prices.karat21Buy,
        sellPrice: prices.karat21Sell
      },
      { 
        type: 'عيار 22', 
        buyPrice: calculateKaratPrice(prices.karat21Buy, 22),
        sellPrice: calculateKaratPrice(prices.karat21Sell, 22)
      },
    ];

    // Add gold pound if available
    if (prices.poundBuy > 0 && prices.poundSell > 0) {
      goldTypes.push({
        type: 'جنيه ذهب',
        buyPrice: prices.poundBuy,
        sellPrice: prices.poundSell
      });
    }

    console.log('📊 الأسعار المحسوبة:', goldTypes);

    const updates: string[] = [];
    const calculationResults: Array<{
      karat: string;
      buyPriceYER: number;
      sellPriceYER: number;
    }> = [];

    // Update database for each karat
    for (const gold of goldTypes) {
      calculationResults.push({
        karat: gold.type,
        buyPriceYER: gold.buyPrice,
        sellPriceYER: gold.sellPrice,
      });

      console.log(`✨ ${gold.type}: شراء ${gold.buyPrice}, بيع ${gold.sellPrice}`);

      // Check if record exists
      const { data: existing } = await supabase
        .from('gold_prices')
        .select('id')
        .eq('city', 'عدن')
        .eq('type', gold.type)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('gold_prices')
          .update({
            buy_price: gold.buyPrice,
            sell_price: gold.sellPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error(`❌ خطأ في تحديث ${gold.type}:`, updateError);
        } else {
          console.log(`✅ تم تحديث ${gold.type} بنجاح`);
          updates.push(gold.type);
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('gold_prices')
          .insert({
            city: 'عدن',
            type: gold.type,
            buy_price: gold.buyPrice,
            sell_price: gold.sellPrice
          });

        if (insertError) {
          console.error(`❌ خطأ في إضافة ${gold.type}:`, insertError);
        } else {
          console.log(`✅ تم إضافة ${gold.type} بنجاح`);
          updates.push(gold.type);
        }
      }
    }

    const timestamp = new Date().toISOString();
    console.log('🎉 تم تحديث أسعار الذهب في عدن بنجاح!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم تحديث أسعار الذهب في عدن بنجاح',
        timestamp,
        city: 'عدن',
        updatedTypes: updates,
        prices: calculationResults,
        source: 'boqash.com',
        formula: 'عيار 18 و 22 محسوبة من عيار 21 باستخدام (السعر × العيار / 21)'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (err) {
    const error = err as Error;
    console.error('❌ خطأ في تحديث أسعار الذهب في عدن:', error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
