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

O esquema inicial está em `supabase/migrations/0001_initial.sql`; a migração `0002_quotation_archiving.sql` adiciona arquivamento reversível às cotações, e `0003_public_quotation_trends.sql` cria uma RPC pública que retorna apenas médias diárias agregadas, exigindo pelo menos três observações por edição/dia. As migrações não contêm dados iniciais. As cotações individuais têm leitura restrita à administração. A RPC de tendências está preparada, mas ainda precisa ser integrada ao adaptador Supabase e validada num projeto Supabase real. A política de estatísticas ainda requer uma função RPC segura para incrementos públicos; não habilite a aplicação em produção antes de concluir essas etapas.

## Segurança

- Nunca versione `.env.local` ou segredos.
- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` em variáveis `NEXT_PUBLIC_*`.
- RLS é obrigatória, mas não substitui validação e autorização no servidor.
- O painel atual não autentica usuários e não deve ser considerado protegido para produção.

## Publicação na Vercel

1. Importe este repositório no painel da Vercel.
2. Configure as variáveis de ambiente somente quando o Supabase estiver pronto.
3. Execute build e testes no ambiente de integração contínua antes de publicar.
4. Para ambiente de produção, defina `MANGATRACK_DATA_MODE=supabase` somente depois que o adaptador Supabase, a autenticação e as políticas tiverem sido implementados e testados.
5. Faça uma implantação de preview, valide acesso público/admin, imagens e políticas, e só então promova para produção.

## Backup e recuperação

- **Banco:** configure backups conforme o plano Supabase; quando disponível, habilite PITR. Faça também exportações periódicas usando ferramenta compatível com PostgreSQL e armazene-as fora do projeto.
- **Storage:** faça backup separado dos objetos de imagem; exportar SQL não copia arquivos de Storage. Preserve caminhos/metadata junto com os objetos.
- **Código:** GitHub é o histórico versionado da aplicação.
- **Segredos:** mantenha inventário seguro das variáveis e recrie-as manualmente no gerenciador apropriado; não coloque valores secretos no backup do repositório.
- **Recuperação:** restaure primeiro em projeto isolado, aplique migrações, restaure objetos do Storage, confira permissões e integridade dos relacionamentos e teste login/consultas antes de trocar tráfego. Faça simulações de restauração regularmente.

## Estado atual

O projeto contém estrutura Next.js, identidade visual responsiva, páginas de início/catálogo/detalhes/cotações/ofertas/admin, formulários locais para obras/edições/cotações/ofertas, edição e arquivamento de obras/edições, gerenciamento de status de ofertas, arquivamento/restauração de cotações, pesquisa no catálogo, filtros de ofertas, gráfico e resumos de preços, cálculos monetários em centavos, validação Zod, testes unitários e migrações SQL versionadas. A integração Supabase funcional, persistência real, autenticação administrativa, estatísticas populares seguras, armazenamento de capas e testes de aceitação completos ainda precisam ser implementados. Não declare a aplicação pronta para produção neste estágio.
