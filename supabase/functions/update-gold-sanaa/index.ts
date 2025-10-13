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
    console.log('🔄 Starting Sana\'a gold price update...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Fetch gold prices from goldpricedata.com
    console.log('📊 Fetching gold prices from goldpricedata.com...');
    const goldResponse = await fetch('https://www.goldpricedata.com/');
    const goldHtml = await goldResponse.text();

    // Parse gold prices from the HTML
    const extractPrice = (text: string, pattern: RegExp): number | null => {
      const match = text.match(pattern);
      if (match && match[1]) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
      return null;
    };

    const gold24 = extractPrice(goldHtml, /جرام الذهب عيار 24k.*?(\d+\.\d+)/s);
    const gold22 = extractPrice(goldHtml, /جرام الذهب عيار 22k.*?(\d+\.\d+)/s);
    const gold21 = extractPrice(goldHtml, /جرام الذهب عيار 21k.*?(\d+\.\d+)/s);
    const gold18 = extractPrice(goldHtml, /جرام الذهب عيار 18k.*?(\d+\.\d+)/s);

    console.log('💰 Gold prices (USD/gram):', {
      'عيار 24': gold24,
      'عيار 22': gold22,
      'عيار 21': gold21,
      'عيار 18': gold18
    });

    if (!gold24 || !gold22 || !gold21 || !gold18) {
      throw new Error('Failed to parse gold prices from website');
    }

    // Step 2: Get Sana'a USD exchange rate
    console.log('💱 Fetching Sana\'a USD exchange rate...');
    const { data: exchangeRates, error: exchangeError } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('city', 'صنعاء')
      .eq('currency_code', 'USD')
      .single();

    if (exchangeError) {
      console.error('Error fetching exchange rates:', exchangeError);
      throw exchangeError;
    }

    const usdBuyRate = exchangeRates.buy_price;
    console.log('💵 USD Buy Rate (Sana\'a):', usdBuyRate);

    // Step 3: Calculate gold prices in YER for Sana'a
    const goldTypes = [
      { type: 'عيار 18', usdPrice: gold18 },
      { type: 'عيار 21', usdPrice: gold21 },
      { type: 'عيار 22', usdPrice: gold22 },
      { type: 'عيار 24', usdPrice: gold24 },
    ];

    const updates: any[] = [];
    const calculationResults: any[] = [];

    for (const gold of goldTypes) {
      // Apply formulas:
      // Buy Price = (Gold Price in USD) * (YER Buy Rate)
      // Sell Price = (Gold Price in USD) * (YER Buy Rate) + 15,000
      const buyPrice = Math.round(gold.usdPrice * usdBuyRate);
      const sellPrice = buyPrice + 15000;

      calculationResults.push({
        karat: gold.type,
        goldPriceUSD: gold.usdPrice,
        exchangeRate: usdBuyRate,
        buyPriceYER: buyPrice,
        sellPriceYER: sellPrice
      });

      console.log(`✨ ${gold.type}:`, {
        'USD/gram': gold.usdPrice,
        'Buy (YER)': buyPrice,
        'Sell (YER)': sellPrice
      });

      // Update or insert into database
      const { data: existing } = await supabase
        .from('gold_prices')
        .select('id')
        .eq('city', 'صنعاء')
        .eq('type', gold.type)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from('gold_prices')
          .update({
            buy_price: buyPrice,
            sell_price: sellPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error(`Error updating ${gold.type}:`, updateError);
        } else {
          console.log(`✅ Updated ${gold.type}`);
          updates.push(gold.type);
        }
      } else {
        const { error: insertError } = await supabase
          .from('gold_prices')
          .insert({
            city: 'صنعاء',
            type: gold.type,
            buy_price: buyPrice,
            sell_price: sellPrice
          });

        if (insertError) {
          console.error(`Error inserting ${gold.type}:`, insertError);
        } else {
          console.log(`✅ Created ${gold.type}`);
          updates.push(gold.type);
        }
      }
    }

    const timestamp = new Date().toISOString();
    console.log('🎉 Sana\'a gold prices updated successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sana\'a gold prices updated successfully',
        timestamp,
        city: 'صنعاء',
        updatedTypes: updates,
        calculations: calculationResults,
        formula: {
          buy: 'Gold Price (USD) × YER Buy Rate',
          sell: 'Gold Price (USD) × YER Buy Rate + 15,000 YER'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error updating Sana\'a gold prices:', error);
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
