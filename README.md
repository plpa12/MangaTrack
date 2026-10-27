# MangaTrack

Plataforma em desenvolvimento para catálogo de mangás, histórico de cotações de coleções usadas completas e ofertas de mangás novos. O catálogo de produção começa vazio; não são inseridas obras, preços ou promoções fictícias.

## Tecnologias

- Next.js App Router, React e TypeScript estrito
- Supabase PostgreSQL, Auth e Storage (integração preparada)
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

Acesse http://localhost:3000. O modo local funciona sem credenciais do Supabase e começa sem dados fictícios. Os cadastros administrativos atuais funcionam apenas na memória do processo: servem para testar fluxos e interface, não são persistentes nem seguros para uso público.

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

## Conectar Supabase posteriormente

1. Crie um projeto no painel do Supabase.
2. Copie URL e chave pública para `.env.local` como `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Configure `MANGATRACK_DATA_MODE=supabase` após implementar e validar o adaptador de produção. A mera presença das variáveis não significa que a conexão ou as telas administrativas já estejam operacionais.
4. Instale Supabase CLI e autentique-se de forma privada.
5. Execute `supabase link --project-ref SEU_PROJECT_REF` e `supabase db push` para aplicar todas as migrações em `supabase/migrations/` em ordem.
6. Crie os buckets de Storage e configure políticas específicas para capas. Não use a chave `service_role` no navegador.
7. Desabilite o cadastro público em Authentication. Crie o primeiro usuário administrador pelo fluxo privado do Supabase e atribua `app_metadata.mangatrack_admin=true` por um procedimento confiável no servidor; nunca permita que o próprio usuário defina esse atributo.
8. Antes de produção, implemente e teste RPCs seguros para estatísticas e resumos de cotações, verifique RLS com contas de visitante e administrador e complete o adaptador de dados.

O esquema inicial está em `supabase/migrations/0001_initial.sql`; a migração `0002_quotation_archiving.sql` adiciona arquivamento reversível às cotações, e `0003_public_quotation_trends.sql` cria uma RPC pública que retorna apenas médias diárias agregadas, exigindo pelo menos três observações por edição/dia. As migrações não contêm dados iniciais. As cotações individuais têm leitura restrita à administração. A migração `0003_public_quotation_trends.sql` disponibiliza somente médias diárias com pelo menos três registros por edição/dia. O adaptador e o fluxo de login já estão no código, mas precisam ser validados em um projeto Supabase real antes de produção. A política de estatísticas ainda requer uma função RPC segura para incrementos públicos.

## Verificação real da integração Supabase

O endpoint público e somente de leitura `/api/health` verifica se o modo Supabase está ativo e se as leituras de obras, edições, ofertas e a RPC de tendências funcionam. Ele retorna apenas estados booleanos, sem dados do catálogo, URLs de projeto ou credenciais. Um resultado `200` com `status: "ok"` confirma a conectividade pública de leitura, mas não substitui o teste autenticado de gravação abaixo.

O teste automatizado abaixo faz login com uma conta administrativa, verifica leitura nas tabelas principais e a RPC pública de tendências, insere uma única obra temporária com título identificável, lê o mesmo registro de volta e tenta excluir somente o UUID recém-criado. Ele não usa a chave `service_role` e não apaga registros existentes.

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
- O painel administrativo verifica a permissão `app_metadata.mangatrack_admin=true` e as gravações também dependem das políticas RLS. Antes de produção, valide o fluxo com uma conta de administrador e outra conta sem privilégios.

## Publicação na Vercel

1. Importe este repositório no painel da Vercel.
2. Configure as variáveis de ambiente somente quando o Supabase estiver pronto.
3. Execute build e testes no ambiente de integração contínua antes de publicar.
4. Configure `MANGATRACK_DATA_MODE=supabase` e as variáveis públicas do Supabase apenas depois de aplicar as migrações e validar a conexão. Não defina `SUPABASE_SERVICE_ROLE_KEY` no cliente; a aplicação não precisa dessa chave para o fluxo normal.
5. Faça uma implantação de preview, valide acesso público/admin, imagens e políticas, e só então promova para produção.

## Backup e recuperação

- **Banco:** configure backups conforme o plano Supabase; quando disponível, habilite PITR. Faça também exportações periódicas usando ferramenta compatível com PostgreSQL e armazene-as fora do projeto.
- **Storage:** faça backup separado dos objetos de imagem; exportar SQL não copia arquivos de Storage. Preserve caminhos/metadata junto com os objetos.
- **Código:** GitHub é o histórico versionado da aplicação.
- **Segredos:** mantenha inventário seguro das variáveis e recrie-as manualmente no gerenciador apropriado; não coloque valores secretos no backup do repositório.
- **Recuperação:** restaure primeiro em projeto isolado, aplique migrações, restaure objetos do Storage, confira permissões e integridade dos relacionamentos e teste login/consultas antes de trocar tráfego. Faça simulações de restauração regularmente.

## Estado atual

O projeto contém estrutura Next.js, identidade visual responsiva, páginas de início/catálogo/detalhes/cotações/ofertas/admin, formulários, pesquisa, filtros, gráficos, validação, testes unitários, migrações SQL versionadas, um adaptador Supabase para obras/edições/cotações/ofertas, login por e-mail e senha com verificação de permissão administrativa, autorização nas ações do servidor e uma RPC pública que fornece somente tendências agregadas de cotações. Ainda falta validar a integração com um projeto Supabase real, configurar e provisionar o primeiro administrador, implementar uma RPC segura para incrementar estatísticas populares, configurar políticas de Storage para capas e concluir testes de aceitação. Não declare a aplicação pronta para produção neste estágio.
