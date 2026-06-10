import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // backend must use service_role

if (!supabaseKey) throw new Error("supabaseKey is required.")

export const supabase = createClient(supabaseUrl, supabaseKey)