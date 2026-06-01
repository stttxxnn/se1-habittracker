import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'VITE_SUPABASE_URL'
const supabaseAnonKey = 'VITE_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)