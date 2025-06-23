
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lgkexjmtzmcwfbkockwj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2V4am10em1jd2Zia29ja3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg1MTMsImV4cCI6MjA2MzE2NDUxM30.XN48krogsQVYmeM8c8WTD0Na6ftk-3ywwcif564r3w0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
