
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

    console.log('بدء التحديث التلقائي المجدول لأسعار SAR و USD من ye-rial.com/aden')

    // استدعاء دالة تحديث SAR و USD
    const { data: sarData, error: sarError } = await supabaseClient.functions.invoke('update-sar-prices', {
      body: { 
        scheduled: true, 
        source: 'ye-rial.com/aden',
        timestamp: new Date().toISOString()
      }
    })

    if (sarError) {
      console.error('خطأ في التحديث المجدول لـ SAR/USD:', sarError)
    } else {
      console.log('تم التحديث المجدول لـ SAR/USD بنجاح:', sarData)
    }

    // استدعاء دالة تحديث EGP من الموقع الجديد
    const { data: egpData, error: egpError } = await supabaseClient.functions.invoke('update-egp-from-2dec', {
      body: { 
        scheduled: true, 
        source: '2dec.net',
        timestamp: new Date().toISOString()
      }
    })

    if (egpError) {
      console.error('خطأ في التحديث المجدول لـ EGP:', egpError)
    } else {
      console.log('تم التحديث المجدول لـ EGP بنجاح:', egpData)
    }

    // استدعاء دالة تحديث AED
    const { data: aedData, error: aedError } = await supabaseClient.functions.invoke('update-aed-prices', {
      body: { 
        scheduled: true, 
        source: 'almashhadalaraby.com',
        timestamp: new Date().toISOString()
      }
    })

    if (aedError) {
      console.error('خطأ في التحديث المجدول لـ AED:', aedError)
    } else {
      console.log('تم التحديث المجدول لـ AED بنجاح:', aedData)
    }

    const results = {
      sar_usd: sarData,
      egp: egpData,
      aed: aedData,
      timestamp: new Date().toISOString(),
      scheduled: true
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم تنفيذ التحديث التلقائي المجدول لجميع العملات',
        results: results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('خطأ في التحديث التلقائي المجدول:', error)
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
