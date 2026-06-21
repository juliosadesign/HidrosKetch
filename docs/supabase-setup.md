# Sprint 19B — Conexão inicial com Supabase

Esta sprint prepara o HidroSketch para usar Supabase, sem implementar login completo ainda.

## Variáveis necessárias

Crie um arquivo `.env.local` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_sua_chave_publicavel
```

Na Vercel, configure as mesmas variáveis em **Settings → Environment Variables** para **Production** e **Preview**.

## Segurança

- Use apenas a chave publicável no frontend.
- Nunca use `sb_secret_...` no React/Vite.
- Mantenha RLS ativo nas tabelas do Supabase.
- O arquivo `.env.local` não deve ir para o GitHub.

## O que esta sprint faz

- Instala `@supabase/supabase-js`.
- Cria `src/lib/supabaseClient.ts`.
- Cria tipos básicos das tabelas em `src/types/supabase.types.ts`.
- Adiciona um indicador visual na barra superior: `Nuvem pronta` ou `Nuvem pendente`.

## Próximas sprints

- Sprint 19C: login e cadastro.
- Sprint 19D: salvar projeto na nuvem.
- Sprint 19E: menu “Meus projetos”.
