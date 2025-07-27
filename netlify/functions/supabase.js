// supabase.js - for use in Netlify functions (server-side)
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vwtiwsjqvqvpgyzeysxb.supabase.co';
// Use the service role key for server-side operations
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3dGl3c2pxdnF2cGd5emV5c3hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxMTUwMiwiZXhwIjoyMDY5MTg3NTAyfQ.b9wBc4ava9ef0h3Q09V5kPkHW1_Apg50X3xzPWgk7a8';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = { supabase };
