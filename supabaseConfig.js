const SUPABASE_URL = 'https://jdflixpbupzwnictncbp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZmxpeHBidXB6d25pY3RuY2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDA4MjksImV4cCI6MjA2ODA3NjgyOX0.pNMVYVU5tw42_qMUhdJI1SE59xs5upVYz0RSyR81AMk';
window.supabase = window.supabase || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
