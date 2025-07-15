// supabaseConfig.js

// Suas credenciais do projeto Supabase.
// É seguro expor a chave 'anon' no lado do cliente (front-end).
const SUPABASE_URL = 'https://jdflixpbupzwnictncbp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZmxpeHBidXB6d25pY3RuY2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDA4MjksImV4cCI6MjA2ODA3NjgyOX0.pNMVYVU5tw42_qMUhdJI1SE59xs5upVYz0RSyR81AMk';

// Verifica se o SDK do Supabase foi carregado antes de tentar criar o cliente.
// O objeto 'supabase' (em minúsculas ) é criado pelo script do Supabase.
if (typeof supabase === 'undefined') {
    console.error('Erro: O SDK do Supabase não foi carregado. Verifique a tag <script> no seu HTML.');
} else {
    // Cria a instância do cliente Supabase.
    // Esta constante 'supabase' estará disponível para os outros scripts que são carregados depois deste.
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Para manter a compatibilidade com o código antigo que pode usar window.supabase,
    // podemos atribuí-lo à janela, mas a prática recomendada é usar a constante diretamente.
    // A melhor prática é renomear a variável para não haver conflito.
    window.supabase = supabaseClient;
}
