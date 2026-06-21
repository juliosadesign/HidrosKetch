# Sprint 19D — Salvar projeto na nuvem

Esta sprint adiciona o primeiro salvamento de projetos no Supabase.

## O que deve funcionar

- O usuário precisa estar logado para salvar na nuvem.
- O botão **Salvar na nuvem** fica disponível na barra superior.
- O primeiro salvamento cria um registro em `public.projects`.
- Salvamentos seguintes atualizam o mesmo projeto enquanto o app estiver aberto.
- Cada salvamento bem-sucedido tenta criar uma entrada em `public.project_versions`.

## Dados salvos em `project_json`

- nome do projeto;
- componentes do editor;
- conexões do editor;
- configurações de escala;
- configurações de energia;
- estado visual do projeto;
- resultado/calculo mais recente;
- validações mais recentes;
- data do salvamento;
- versão do formato do arquivo.

## Como testar

1. Execute o app localmente.
2. Faça login.
3. Monte uma rede simples.
4. Clique em **Salvar na nuvem**.
5. Abra o Supabase e confira as tabelas `projects` e `project_versions`.

## Segurança

O frontend usa apenas a chave publicável do Supabase. As regras RLS continuam protegendo os dados por usuário.
