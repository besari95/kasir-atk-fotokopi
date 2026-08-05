import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://jqhiroygophpabzxyiyx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxaGlyb3lnb3BocGFienh5aXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4ODAzMDksImV4cCI6MjEwMTQ1NjMwOX0.NwPlYOkbGUsoifwTC32yVoJhDp29CNkyVS_ZVcQGt_s'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)