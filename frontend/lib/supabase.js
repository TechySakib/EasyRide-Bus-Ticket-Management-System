import { createClient } from '@supabase/supabase-js'






const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://arctidbknjjajstoitas.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Qpg550_nF9GVcZA4CejHgA_79GIdXvk'

/**
 * Supabase client instance for the frontend.
 * Initialized with environment variables for URL and Anon Key.
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(supabaseUrl, supabaseKey)
