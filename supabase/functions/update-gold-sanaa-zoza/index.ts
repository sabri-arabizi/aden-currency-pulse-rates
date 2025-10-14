import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 بدء تحديث أسعار الذهب في صنعاء من zoza.top...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Fetch gold prices from zoza.top
    console.log('📊 جلب أسعار الذهب من zoza.top...');
    const goldResponse = await fetch('https://zoza.top/gold/ar.php?b=YER');
    const goldHtml = await goldResponse.text();

    // Step 2: Parse gold prices from HTML
    const extractGoldPrice = (html: string, karat: string): number | null => {
      // Try different patterns to match the price
      const patterns = [
        new RegExp(`سعر جرام ذهب عيار ${karat} في اليمن صنعاء\\s*:\\s*([\\d.,]+)\\s*ريال يمني`, 'i'),
        new RegExp(`عيار ${karat}.*?([\\d.,]+)\\s*ريال`, 'i'),
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          // Remove any commas and parse as float
          const cleanPrice = match[1].replace(/,/g, '');
          const price = parseFloat(cleanPrice);
          if (!isNaN(price) && price > 0) {
            return price;
          }
        }
      }
      return null;
    };

    const gold18 = extractGoldPrice(goldHtml, '18');
    const gold21 = extractGoldPrice(goldHtml, '21');
    const gold24 = extractGoldPrice(goldHtml, '24');

    console.log('💰 الأسعار المستخرجة من الموقع:', {
      'عيار 18': gold18,
      'عيار 21': gold21,
      'عيار 24': gold24
    });

    if (!gold18 || !gold21 || !gold24) {
      throw new Error('فشل في استخراج أسعار الذهب من الموقع');
    }

    // Step 3: Calculate buy and sell prices
    // The prices from zoza.top are base market prices
    // For buy price: we'll use base price - 500 YER (to simulate buying from customers)
    // For sell price: we'll use base price (to simulate selling to customers)
    const buyDiscount = 500; // Discount when buying from customers

    const goldTypes = [
      { 
        type: 'عيار 18', 
        basePrice: gold18,
        buyPrice: Math.round(gold18 - buyDiscount),
        sellPrice: Math.round(gold18)
      },
      { 
        type: 'عيار 21', 
        basePrice: gold21,
        buyPrice: Math.round(gold21 - buyDiscount),
        sellPrice: Math.round(gold21)
      },
      { 
        type: 'عيار 24', 
        basePrice: gold24,
        buyPrice: Math.round(gold24 - buyDiscount),
        sellPrice: Math.round(gold24)
      },
    ];

    const updates: any[] = [];
    const calculationResults: any[] = [];

    // Step 4: Update database
    for (const gold of goldTypes) {
      calculationResults.push({
        karat: gold.type,
        basePriceYER: gold.basePrice,
        buyPriceYER: gold.buyPrice,
        sellPriceYER: gold.sellPrice,
        buyDiscount: buyDiscount
      });

      console.log(`✨ ${gold.type}:`, {
        'السعر الأساسي (YER)': gold.basePrice,
        'سعر الشراء (YER)': gold.buyPrice,
        'سعر البيع (YER)': gold.sellPrice
      });

      // Check if record exists
      const { data: existing } = await supabase
        .from('gold_prices')
        .select('id')
        .eq('city', 'صنعاء')
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
            city: 'صنعاء',
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
    console.log('🎉 تم تحديث أسعار الذهب في صنعاء بنجاح!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم تحديث أسعار الذهب في صنعاء بنجاح',
        timestamp,
        city: 'صنعاء',
        updatedTypes: updates,
        calculations: calculationResults,
        source: 'zoza.top',
        note: 'سعر الشراء = السعر الأساسي - 500 ريال يمني، سعر البيع = السعر الأساسي'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ خطأ في تحديث أسعار الذهب في صنعاء:', error);
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
