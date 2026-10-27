import Link from "next/link";
import { AlertTriangle, BookOpen, Database, ShieldCheck, Tag, TrendingUp } from "lucide-react";
import { getDataModeLabel, dataRepository } from "@/lib/data";
import MangaForm from "./manga-form";
import { EditionForm, OfferForm, QuotationForm } from "./data-forms";
import MangaManagement from "./manga-management";
import EditionManagement from "./edition-management";
import OfferManagement from "./offer-management";

export default async function AdminPage() {
  const local = getDataModeLabel().startsWith("Modo local");
  const [mangas, editions, quotations, offers] = await Promise.all([
    dataRepository.listManga(),
    dataRepository.listEditions(),
    dataRepository.listQuotations(),
    dataRepository.listOffers()
  ]);
  return <div>
    <div className="page-heading"><div><span className="eyebrow">GERENCIAMENTO</span><h1>Painel administrativo</h1><p>Área de preparação para cadastro de obras, edições, cotações e ofertas.</p></div><span className="pill pill-warning">Acesso de desenvolvimento</span></div>
    <div className="notice"><AlertTriangle size={16} style={{display:"inline",verticalAlign:"middle",marginRight:7,color:"#e8c46b"}}/><strong>Importante:</strong> este painel ainda não tem autenticação de produção. No modo de desenvolvimento, os cadastros ficam apenas na memória do processo e podem desaparecer ao reiniciar. Em produção, as gravações estão desativadas até existir autenticação e persistência seguras. Não use para dados reais.</div>
    <div className="stats-grid">
      <div className="stat-card"><span className="stat-icon"><Database size={20}/></span><div><small>Modo de dados</small><strong style={{fontSize:15}}>{local ? "Local temporário" : "Supabase não ativo"}</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><BookOpen size={20}/></span><div><small>Obras / edições</small><strong>{mangas.length} / {editions.length}</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><ShieldCheck size={20}/></span><div><small>Autenticação</small><strong style={{fontSize:15}}>Pendente</strong></div></div>
    </div>
    <section><div className="section-head"><div><h2>Cadastrar obra</h2><p>Título e autor são obrigatórios; capa e dados editoriais podem ser adicionados depois.</p></div></div><div className="panel"><MangaForm /></div></section>
    <section><div className="section-head"><div><h2>Editar ou arquivar obras</h2><p>Atualize os dados editoriais ou arquive uma obra sem apagar o histórico.</p></div></div><MangaManagement mangas={mangas}/></section>
    <section><div className="section-head"><div><h2>Cadastrar edição</h2><p>Uma obra pode ter edições brasileiras, formatos e editoras diferentes.</p></div></div><div className="panel"><EditionForm mangas={mangas}/></div></section>
    <section><div className="section-head"><div><h2>Editar ou arquivar edições</h2><p>Atualize os dados editoriais e preserve o histórico ao arquivar.</p></div></div><EditionManagement editions={editions} mangas={mangas}/></section>
    <section><div className="section-head"><div><h2>Registrar cotação</h2><p>Somente preços de coleções usadas completas entram no histórico.</p></div></div><div className="panel"><QuotationForm editions={editions}/></div></section>
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
