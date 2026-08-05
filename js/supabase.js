import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'GANTI_DENGAN_PROJECT_URL_KAMU'
const SUPABASE_ANON_KEY = 'GANTI_DENGAN_ANON_KEY_KAMU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)