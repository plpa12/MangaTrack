# MangaTrack

Plataforma em desenvolvimento para catálogo de mangás, histórico de cotações de coleções usadas completas e ofertas de mangás novos. O catálogo de produção começa vazio; não são inseridas obras, preços ou promoções fictícias.

## Tecnologias

- Next.js App Router, React e TypeScript estrito
- Supabase PostgreSQL, Auth e Storage (integração conectada ao ambiente de produção)
- Recharts para gráficos de histórico de preços
- Vitest para testes de regras de negócio
- Vercel como destino de publicação

## Requisitos e instalação

Requer Node.js 20.9+ e npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse http://localhost:3000. O modo local funciona sem credenciais do Supabase e começa sem dados fictícios. Para usar o catálogo persistente localmente, configure as variáveis do Supabase e `MANGATRACK_DATA_MODE=supabase`; o painel administrativo exige uma conta autorizada.

## Scripts

- `npm run dev`: desenvolvimento
- `npm run build`: build de produção
- `npm run typecheck`: verificação TypeScript
- `npm run lint`: lint
- `npm test`: testes unitários

## Pré-visualização no navegador

Abra [MangaTrack no StackBlitz](https://stackblitz.com/github/plpa12/MangaTrack?startScript=dev). O projeto será importado no navegador e o comando de desenvolvimento será iniciado; a prévia pode levar alguns instantes para instalar as dependências. O arquivo `.stackblitzrc` seleciona o modo local.

A prévia é um ambiente temporário de desenvolvimento, não um endereço de produção. Os dados cadastrados podem desaparecer ao reiniciar o ambiente, não são compartilhados entre instâncias e não devem ser considerados persistentes.

## Modo de desenvolvimento

`MANGATRACK_DATA_MODE=local` é o padrão. A interface apresenta um aviso para que dados locais não sejam confundidos com dados persistentes. O catálogo inicial é vazio. O painel administrativo permite testar cadastro de obras, edições, cotações e ofertas, mas **não possui autenticação de produção** e o armazenamento é apenas em memória; não use para dados reais.

## Integração Supabase e migrações

1. Crie um projeto no painel do Supabase.
2. Copie URL e chave pública para `.env.local` como `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Configure `MANGATRACK_DATA_MODE=supabase` depois de aplicar as migrações e validar a conexão. No ambiente de produção conectado, a aplicação já está usando esse modo; `/api/health` valida as leituras e as proteções básicas.
4. Instale Supabase CLI e autentique-se de forma privada.
5. Execute `supabase link --project-ref SEU_PROJECT_REF` e `supabase db push` para aplicar todas as migrações em `supabase/migrations/` em ordem.
6. As migrações `0011_storage_covers_and_popularity.sql`, `0012_index_offer_relationships.sql` e `0013_use_invoker_for_popularity_reads.sql` e `0014_restrict_popularity_increment.sql` e `0015_move_admin_helper_to_private_schema.sql` provisionam o bucket público `mangatrack-covers` (máximo 5 MB; JPEG/PNG/WebP/AVIF), leitura pública e gravação/exclusão restrita a administradores. Não use a chave `service_role` no navegador.
7. Desabilite o cadastro público em Authentication. Crie o primeiro usuário administrador pelo fluxo privado do Supabase e atribua `app_metadata.mangatrack_admin=true` por um procedimento confiável no servidor; nunca permita que o próprio usuário defina esse atributo.
8. Antes de considerar a produção totalmente validada, execute o teste autenticado de gravação descrito abaixo e verifique RLS com contas de visitante e administrador.

O esquema inicial está em `supabase/migrations/0001_initial.sql`; as migrações seguintes adicionam arquivamento, RPCs públicas de cotações e restrições de leitura para ofertas. A migração `0003_public_quotation_trends.sql` originalmente exigia três registros por edição/dia para publicar uma média; `0007_quotation_history_aggregation.sql` remove esse limite, pois o histórico deve funcionar com cotações coletadas em dias diferentes. A média geral considera todas as cotações elegíveis da edição; o gráfico agrupa por dia. Os preços e as datas de cotações elegíveis são expostos intencionalmente pelas RPCs públicas `get_public_quotation_values` e `get_public_quotation_trends`, mas a leitura direta das linhas da tabela `quotations` continua restrita à administração. Links de anúncios e observações privadas nunca são retornados pelas RPCs públicas. Os filtros públicos incluem apenas preços positivos de coleções completas, não arquivadas, pertencentes a edições e obras ativas. A migração `0004_offer_column_privileges.sql` também impede a leitura pública da evidência interna do preço anterior de ofertas. As migrações não contêm dados iniciais.

Se as migrações anteriores já foram executadas manualmente no projeto Supabase, execute **somente as migrações ainda pendentes** no SQL Editor do mesmo projeto; não reexecute migrações antigas. A correção de agregação `0007_quotation_history_aggregation.sql` deve ser aplicada depois das migrações anteriores, incluindo `0006_public_quotation_values.sql`. O adaptador e o fluxo de login estão conectados ao projeto Supabase; ainda é necessário concluir a validação autenticada de gravação descrita abaixo. A migração `0011_storage_covers_and_popularity.sql` adiciona as RPCs `increment_manga_search_count` e `get_public_popular_manga`. A tela de detalhes registra uma consulta por obra a cada 24 horas por navegador, e a página inicial só exibe o ranking quando houver contagens reais. Como a contagem pública é necessariamente acessível ao papel anônimo, a RPC só incrementa obras ativas e não retorna dados privados; ainda é recomendável adicionar limitação antiabuso no perímetro da aplicação antes de tráfego elevado.

## Verificação real da integração Supabase

O endpoint `/api/health` verifica se o modo Supabase está ativo, se as leituras de obras/edições/ofertas e as RPCs de tendências, contagem pública e ranking popular funcionam, se o contador de popularidade tem a configuração privada necessária e se o bucket de capas pode ser consultado e se a coluna interna `previous_price_evidence` está bloqueada para leitura pública. Ele retorna apenas estados booleanos, sem dados do catálogo, URLs de projeto ou credenciais. Um resultado `200` com `status: "ok"` confirma esses testes de leitura e proteção, mas não substitui o teste autenticado de gravação abaixo.

O teste automatizado abaixo faz login com uma conta administrativa, verifica leitura nas tabelas principais e as RPCs públicas de tendências e contagem de cotações, insere uma única obra temporária com título identificável, lê o mesmo registro de volta e tenta excluir somente o UUID recém-criado. Ele não usa a chave `service_role` e não apaga registros existentes.

Para executá-lo em uma cópia local do projeto, configure as variáveis abaixo apenas no terminal/ambiente local, usando uma conta que já tenha `app_metadata.mangatrack_admin=true`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SMOKE_TEST_EMAIL`
- `SUPABASE_SMOKE_TEST_PASSWORD`

Depois rode `npm run test:supabase`. Não coloque a senha em arquivos versionados, não a envie pelo chat e não configure a senha de teste na Vercel. Se a limpeza falhar, o script sinaliza isso; remova apenas o registro de teste identificado no resultado, nunca registros existentes. O teste não foi executado automaticamente no deploy, pois exige credenciais de um administrador. Alternativamente, configure os quatro valores como **GitHub Actions repository secrets** com os mesmos nomes e execute `Actions → Supabase integration smoke test → Run workflow`; marque a confirmação de gravação temporária. O workflow é manual e não roda durante os deploys normais.

## Segurança

- Nunca versione `.env.local` ou segredos.
- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` em variáveis `NEXT_PUBLIC_*`.
- RLS é obrigatória, mas não substitui validação e autorização no servidor.
- O painel administrativo verifica a permissão `app_metadata.mangatrack_admin=true` e as gravações também dependem das políticas RLS. Valide o fluxo com uma conta de administrador e outra conta sem privilégios.

## Publicação na Vercel

1. Importe este repositório no painel da Vercel.
2. Configure as variáveis de ambiente somente quando o Supabase estiver pronto.
3. Execute build e testes no ambiente de integração contínua antes de publicar.
4. Configure `MANGATRACK_DATA_MODE=supabase`, as variáveis públicas do Supabase e `SUPABASE_SERVICE_ROLE_KEY` como variável privada de ambiente de produção. A chave de serviço é usada exclusivamente no servidor para registrar popularidade e não deve ser exposta ao navegador.
5. Faça uma implantação de preview, valide acesso público/admin, imagens e políticas, e só então promova para produção.

## Backup e recuperação

- **Banco:** configure backups conforme o plano Supabase; quando disponível, habilite PITR. Faça também exportações periódicas usando ferramenta compatível com PostgreSQL e armazene-as fora do projeto.
- **Storage:** faça backup separado dos objetos de imagem; exportar SQL não copia arquivos de Storage. Preserve caminhos/metadata junto com os objetos.
- **Código:** GitHub é o histórico versionado da aplicação.
- **Segredos:** mantenha inventário seguro das variáveis e recrie-as manualmente no gerenciador apropriado; não coloque valores secretos no backup do repositório.
- **Recuperação:** restaure primeiro em projeto isolado, aplique migrações, restaure objetos do Storage, confira permissões e integridade dos relacionamentos e teste login/consultas antes de trocar tráfego. Faça simulações de restauração regularmente.

## Estado atual

O projeto contém estrutura Next.js, páginas públicas e administrativas, adaptador Supabase para obras/edições/cotações/ofertas, login e autorização administrativa, RPCs de cotações e popularidade, bucket de capas com políticas de Storage, upload de imagem validado e testes unitários. A migração de capas/popularidade foi aplicada ao projeto conectado sem alterar nem semear registros do catálogo. O endpoint `/api/health` foi verificado em produção e retornou `status: "ok"` com todas as verificações passando. Ainda faltam a validação autenticada de escrita com uma conta administradora, a ativação da proteção contra senhas vazadas e uma revisão final de abuso/limitação de tráfego antes de considerar o projeto pronto para produção. A migração `0012_index_offer_relationships.sql` adiciona índices às relações de ofertas com obras e edições após o aviso de chaves estrangeiras sem índice. A migração `0013_use_invoker_for_popularity_reads.sql` usa permissões do chamador na leitura do ranking, pois as políticas RLS públicas já limitam as linhas visíveis. A migração `0014_restrict_popularity_increment.sql` impede chamadas diretas de visitantes à função de incremento; a rota do Next.js usa a chave `SUPABASE_SERVICE_ROLE_KEY` exclusivamente no servidor. Configure essa variável como segredo privado no ambiente publicado para habilitar o contador; nunca use `NEXT_PUBLIC_` nesse nome. A migração `0015_move_admin_helper_to_private_schema.sql` move a verificação de administrador para o esquema privado e atualiza as políticas RLS/Storage para que a função auxiliar não seja exposta como RPC pública.
