import Link from "next/link";
import { redirect } from "next/navigation";
import { dataMode } from "@/lib/data";
import { isSupabaseAdmin } from "@/lib/supabase/admin";
import { logoutAction } from "@/app/login/actions";
import { AlertTriangle, BookOpen, Database, ShieldCheck, Tag, TrendingUp } from "lucide-react";
import { getDataModeLabel, dataRepository } from "@/lib/data";
import MangaForm from "./manga-form";
import { EditionForm, OfferForm, QuotationForm } from "./data-forms";
import MangaManagement from "./manga-management";
import EditionManagement from "./edition-management";
import OfferManagement from "./offer-management";
import QuotationManagement from "./quotation-management";

export default async function AdminPage() {
  if (dataMode === "supabase" && !(await isSupabaseAdmin())) redirect("/login");
  const local = getDataModeLabel().startsWith("Modo local");
  const [mangas, editions, archivedMangas, archivedEditions, quotations, offers] = await Promise.all([
    dataRepository.listManga(),
    dataRepository.listEditions(),
    dataRepository.listArchivedManga(),
    dataRepository.listArchivedEditions(),
    dataRepository.listQuotations(undefined, true),
    dataRepository.listOffers()
  ]);
  return <div>
    <div className="page-heading"><div><span className="eyebrow">GERENCIAMENTO</span><h1>Painel administrativo</h1><p>Gerencie obras, edições, cotações e ofertas.</p></div>{dataMode === "supabase" ? <form action={logoutAction}><button className="button" type="submit">Sair da conta</button></form> : <span className="pill pill-warning">Acesso de desenvolvimento</span>}</div>
    {dataMode === "supabase" ? <div className="notice"><ShieldCheck size={16} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/><strong>Supabase conectado.</strong> As operações são autorizadas pelo Supabase Auth e pelas políticas RLS do banco.</div> : <div className="notice"><AlertTriangle size={16} style={{display:"inline",verticalAlign:"middle",marginRight:7,color:"#e8c46b"}}/><strong>Modo de desenvolvimento:</strong> os cadastros ficam apenas na memória do processo e podem desaparecer ao reiniciar. Não use para dados reais.</div>}
    <div className="stats-grid">
      <div className="stat-card"><span className="stat-icon"><Database size={20}/></span><div><small>Modo de dados</small><strong style={{fontSize:15}}>{dataMode === "supabase" ? "Supabase ativo" : "Local temporário"}</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><BookOpen size={20}/></span><div><small>Obras / edições</small><strong>{mangas.length} / {editions.length}</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><ShieldCheck size={20}/></span><div><small>Autenticação</small><strong style={{fontSize:15}}>{dataMode === "supabase" ? "Verificada" : "Pendente"}</strong></div></div>
    </div>
    <section><div className="section-head"><div><h2>Cadastrar obra</h2><p>Título e autor são obrigatórios; capa e dados editoriais podem ser adicionados depois.</p></div></div><div className="panel"><MangaForm /></div></section>
    <section><div className="section-head"><div><h2>Editar ou arquivar obras</h2><p>Atualize os dados editoriais ou arquive uma obra sem apagar o histórico.</p></div></div><MangaManagement mangas={mangas} archivedMangas={archivedMangas}/></section>
    <section><div className="section-head"><div><h2>Cadastrar edição</h2><p>Uma obra pode ter edições brasileiras, formatos e editoras diferentes.</p></div></div><div className="panel"><EditionForm mangas={mangas}/></div></section>
    <section><div className="section-head"><div><h2>Editar ou arquivar edições</h2><p>Atualize os dados editoriais e preserve o histórico ao arquivar.</p></div></div><EditionManagement editions={editions} archivedEditions={archivedEditions} mangas={[...mangas, ...archivedMangas]}/></section>
    <section><div className="section-head"><div><h2>Registrar cotação</h2><p>Somente preços de coleções usadas completas entram no histórico.</p></div></div><div className="panel"><QuotationForm editions={editions}/></div></section>
    <section><div className="section-head"><div><h2>Gerenciar cotações</h2><p>Arquive registros inválidos sem apagá-los; cotações arquivadas não entram nas médias.</p></div></div><QuotationManagement quotations={quotations} editions={editions} mangas={mangas}/></section>
    <section><div className="section-head"><div><h2>Cadastrar oferta de mangá novo</h2><p>Descontos só aparecem com preço anterior confirmado e evidência.</p></div></div><div className="panel"><OfferForm mangas={mangas} editions={editions}/></div></section>
    <section><div className="section-head"><div><h2>Gerenciar ofertas</h2><p>Altere o status para publicar, desativar ou marcar ofertas como expiradas.</p></div></div><OfferManagement offers={offers}/></section>
    <div className="section-head"><div><h2>Resumo temporário</h2><p>Os registros abaixo existem apenas enquanto este processo estiver ativo.</p></div></div>
    <div className="admin-grid">
      <div className="panel"><h2><BookOpen size={17} style={{display:"inline",verticalAlign:"middle",marginRight:8}}/>Obras e edições</h2><p className="muted">{mangas.length} obras e {editions.length} edições no armazenamento temporário.</p><Link href="/mangas" className="button">Ver catálogo</Link></div>
      <div className="panel"><h2><TrendingUp size={17} style={{display:"inline",verticalAlign:"middle",marginRight:8}}/>Cotações</h2><p className="muted">{quotations.length} registros de coleções completas.</p><Link href="/quotations" className="button">Ver cotações</Link></div>
      <div className="panel"><h2><Tag size={17} style={{display:"inline",verticalAlign:"middle",marginRight:8}}/>Ofertas</h2><p className="muted">{offers.length} ofertas cadastradas, incluindo rascunhos.</p><Link href="/offers" className="button">Ver ofertas</Link></div>
      <div className="panel"><h2><ShieldCheck size={17} style={{display:"inline",verticalAlign:"middle",marginRight:8}}/>Configuração</h2><p className="muted">O login real exige Supabase Auth, autorização no servidor e políticas RLS.</p><Link className="button" href="/login">Configurar acesso</Link></div>
    </div>
  </div>;
}
