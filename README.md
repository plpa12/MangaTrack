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

Acesse http://localhost:3000. O modo local funciona sem credenciais do Supabase. O adaptador atual é deliberadamente vazio e não oferece persistência; operações administrativas de gravação ainda não estão habilitadas. Não há dados fictícios pré-carregados.

## Scripts

- `npm run dev`: desenvolvimento
- `npm run build`: build de produção
- `npm run typecheck`: verificação TypeScript
- `npm run lint`: lint
- `npm test`: testes unitários

## Modo de desenvolvimento

`MANGATRACK_DATA_MODE=local` é o padrão. A interface apresenta um aviso para que dados locais não sejam confundidos com dados persistentes. O catálogo inicial é vazio. O painel administrativo é apenas uma área informativa e **não é autenticação de produção**; não use para cadastrar dados reais.

## Conectar Supabase posteriormente

1. Crie um projeto no painel do Supabase.
2. Copie URL e chave pública para `.env.local` como `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Configure `MANGATRACK_DATA_MODE=supabase` após implementar e validar o adaptador de produção. A mera presença das variáveis não significa que a conexão ou as telas administrativas já estejam operacionais.
4. Instale Supabase CLI e autentique-se de forma privada.
5. Execute `supabase link --project-ref SEU_PROJECT_REF` e `supabase db push` para aplicar `supabase/migrations/0001_initial.sql`.
6. Crie os buckets de Storage e configure políticas específicas para capas. Não use a chave `service_role` no navegador.
7. Desabilite o cadastro público em Authentication. Crie o primeiro usuário administrador pelo fluxo privado do Supabase e atribua `app_metadata.mangatrack_admin=true` por um procedimento confiável no servidor; nunca permita que o próprio usuário defina esse atributo.
8. Antes de produção, implemente e teste RPCs seguros para estatísticas e resumos de cotações, verifique RLS com contas de visitante e administrador e complete o adaptador de dados.

O esquema inicial está em `supabase/migrations/0001_initial.sql`. Ele não contém dados iniciais. As cotações individuais têm leitura restrita à administração. A política de estatísticas ainda requer uma função RPC segura para incrementos públicos; não habilite a aplicação em produção antes de concluir essa etapa.

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

A primeira etapa contém estrutura Next.js, identidade visual responsiva, páginas-base, tipos de domínio, cálculos monetários em centavos, filtros de ofertas, adaptador local vazio e migração SQL inicial. O catálogo, os formulários de escrita, a integração Supabase funcional, autenticação administrativa, gráficos ligados a dados e estatísticas seguras ainda precisam ser implementados e verificados. Não declare a aplicação pronta para produção neste estágio.
