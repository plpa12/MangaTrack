import Link from "next/link";
import { AlertTriangle, BookOpen, Database, ShieldCheck, Tag, TrendingUp } from "lucide-react";
import { getDataModeLabel } from "@/lib/data";
import { localData } from "@/lib/data/local";
import MangaForm from "./manga-form";

export default function AdminPage() {
  const local = getDataModeLabel().startsWith("Modo local");
  const mangas = localData.listManga();
  return <div>
    <div className="page-heading"><div><span className="eyebrow">GERENCIAMENTO</span><h1>Painel administrativo</h1><p>Área de preparação para cadastro de obras, edições, cotações e ofertas.</p></div><span className="pill pill-warning">Acesso de desenvolvimento</span></div>
    <div className="notice"><AlertTriangle size={16} style={{display:"inline",verticalAlign:"middle",marginRight:7,color:"#e8c46b"}}/><strong>Importante:</strong> este painel ainda não tem autenticação de produção. O cadastro de obras funciona apenas no modo local e mantém os dados na memória do processo; eles não são persistidos e podem desaparecer ao reiniciar.</div>
    <div className="stats-grid">
      <div className="stat-card"><span className="stat-icon"><Database size={20}/></span><div><small>Modo de dados</small><strong style={{fontSize:15}}>{local ? "Local temporário" : "Supabase"}</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><BookOpen size={20}/></span><div><small>Obras disponíveis</small><strong>{mangas.length}</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><ShieldCheck size={20}/></span><div><small>Autenticação</small><strong style={{fontSize:15}}>Pendente</strong></div></div>
    </div>
    <div className="section-head"><div><h2>Cadastrar obra</h2><p>Título e autor são obrigatórios; capa e dados editoriais podem ser adicionados depois.</p></div></div>
    <div className="panel"><MangaForm /></div>
    <div className="section-head"><div><h2>Áreas de gerenciamento</h2><p>As outras operações serão ativadas após implementação de persistência e autorização seguras.</p></div></div>
    <div className="admin-grid">
      <div className="panel"><h2><BookOpen size={17} style={{display:"inline",verticalAlign:"middle",marginRight:8}}/>Obras e edições</h2><p className="muted">O cadastro local de obras está disponível para testar a interface. Edições e arquivamento ainda não estão implementados.</p><Link href="/mangas" className="button">Ver catálogo</Link></div>
      <div className="panel"><h2><TrendingUp size={17} style={{display:"inline",verticalAlign:"middle",marginRight:8}}/>Cotações</h2><p className="muted">Somente coleções usadas completas serão válidas. Os registros detalhados serão restritos à administração.</p><Link href="/quotations" className="button">Ver cotações</Link></div>
      <div className="panel"><h2><Tag size={17} style={{display:"inline",verticalAlign:"middle",marginRight:8}}/>Ofertas</h2><p className="muted">Rascunhos, publicação manual, evidência de preço anterior e expiração ainda precisam de formulários e persistência.</p><Link href="/offers" className="button">Ver ofertas</Link></div>
      <div className="panel"><h2><ShieldCheck size={17} style={{display:"inline",verticalAlign:"middle",marginRight:8}}/>Configuração</h2><p className="muted">O login real exige Supabase Auth, autorização no servidor e políticas RLS verificadas.</p><Link className="button" href="/login">Configurar acesso</Link></div>
    </div>
  </div>;
}