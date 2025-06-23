import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kqzhrbnyrpzgjlnanyww.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxemhyYm55cnB6Z2psbmFueXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODQ2OTcsImV4cCI6MjA2NjI2MDY5N30.OUhKqW6XvlQHOXgzCY-a5bvv9TDZ0uvcTrGT0cjM2Lk';

export const supabase = createClient(supabaseUrl, supabaseKey); 