import { createClient } from '@supabase/supabase-js'






const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://arctidbknjjajstoitas.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Qpg550_nF9GVcZA4CejHgA_79GIdXvk'

export const supabase = createClient(supabaseUrl, supabaseKey)
