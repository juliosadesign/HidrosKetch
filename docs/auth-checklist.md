# Checklist de autenticação — HidroSketch

Esta etapa adiciona login e cadastro com Supabase Auth, mas ainda não salva projetos na nuvem.

## Requisitos no Supabase

1. Tabelas criadas: `profiles`, `projects`, `project_versions` e `shared_projects`.
2. RLS ativado nas tabelas públicas.
3. Provider de e-mail ativado em Authentication → Sign In / Providers.
4. URLs configuradas em Authentication → URL Configuration:
   - `http://localhost:5173`
   - URL pública da Vercel.

## Variáveis necessárias

No `.env.local` e na Vercel:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publicavel
```

Nunca use `sb_secret_...` no frontend.

## Teste manual

1. Rodar `npm run dev`.
2. Clicar em **Entrar** na barra superior.
3. Criar uma conta com e-mail e senha.
4. Entrar com a conta criada.
5. Recarregar a página e conferir se a sessão continua ativa.
6. Clicar em **Sair**.

## Próxima etapa

A próxima sprint deve salvar e listar projetos na nuvem usando a conta autenticada.
