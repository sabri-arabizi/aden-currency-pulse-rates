import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    console.log(`🚀 Backend Server - ${method} ${path}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Router logic
    switch (path) {
      case '/health':
        return handleHealth();

      case '/api/exchange-rates':
        return await handleExchangeRates(supabase, method, req);

      case '/api/gold-prices':
        return await handleGoldPrices(supabase, method, req);

      case '/api/update-all':
        return await handleUpdateAll(supabase);

      case '/api/statistics':
        return await handleStatistics(supabase);

      default:
        return new Response(
          JSON.stringify({ error: 'Route not found', path }), 
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('❌ Backend Server Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Health check endpoint
function handleHealth() {
  return new Response(
    JSON.stringify({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'Yemen Currency App Backend'
    }), 
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Handle exchange rates API
async function handleExchangeRates(supabase: any, method: string, req: Request) {
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ data }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  if (method === 'POST') {
    const body = await req.json();
    const { data, error } = await supabase
      .from('exchange_rates')
      .insert(body)
      .select();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ data }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }), 
    { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Handle gold prices API
async function handleGoldPrices(supabase: any, method: string, req: Request) {
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('gold_prices')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ data }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  if (method === 'POST') {
    const body = await req.json();
    const { data, error } = await supabase
      .from('gold_prices')
      .insert(body)
      .select();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ data }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }), 
    { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Update all prices
async function handleUpdateAll(supabase: any) {
  const results = {
    sar_update: null,
    aed_update: null,
    egp_update: null,
    gold_update: null,
    sanaa_rates: null
  };

  try {
    // Update SAR prices
    const sarResponse = await supabase.functions.invoke('update-sar-prices', {
      body: { manual: true }
    });
    results.sar_update = sarResponse;

    // Update AED prices
    const aedResponse = await supabase.functions.invoke('update-aed-prices', {
      body: { manual: true }
    });
    results.aed_update = aedResponse;

    // Update EGP prices
    const egpResponse = await supabase.functions.invoke('update-egp-from-2dec', {
      body: { manual: true }
    });
    results.egp_update = egpResponse;

    // Update Gold prices
    const goldResponse = await supabase.functions.invoke('update-gold-prices', {
      body: { manual: true }
    });
    results.gold_update = goldResponse;

    // Update Sanaa rates
    const sanaaResponse = await supabase.functions.invoke('update-sanaa-rates-from-khbr', {
      body: { manual: true }
    });
    results.sanaa_rates = sanaaResponse;

    console.log('✅ تم تحديث جميع الأسعار بنجاح');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم تحديث جميع الأسعار بنجاح',
        results 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ خطأ في تحديث الأسعار:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'فشل في تحديث بعض الأسعار',
        results 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Get statistics
async function handleStatistics(supabase: any) {
  try {
    // Count exchange rates
    const { count: exchangeCount } = await supabase
      .from('exchange_rates')
      .select('*', { count: 'exact', head: true });

    // Count gold prices
    const { count: goldCount } = await supabase
      .from('gold_prices')
      .select('*', { count: 'exact', head: true });

    // Get latest updates
    const { data: latestExchange } = await supabase
      .from('exchange_rates')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);

    const { data: latestGold } = await supabase
      .from('gold_prices')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);

    return new Response(
      JSON.stringify({
        statistics: {
          total_exchange_records: exchangeCount || 0,
          total_gold_records: goldCount || 0,
          latest_exchange_update: latestExchange?.[0]?.updated_at || null,
          latest_gold_update: latestGold?.[0]?.updated_at || null,
          server_time: new Date().toISOString()
        }
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ خطأ في جلب الإحصائيات:', error);
    throw error;
  }
}