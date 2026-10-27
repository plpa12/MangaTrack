import Link from "next/link";
import { AlertTriangle, BookOpen, Database, ShieldCheck, Tag, TrendingUp } from "lucide-react";
import { getDataModeLabel } from "@/lib/data";

export default function AdminPage() {
  const local = getDataModeLabel().startsWith("Modo local");
  return <div>
    <div className="page-heading"><div><span className="eyebrow">GERENCIAMENTO</span><h1>Painel administrativo</h1><p>Área de preparação para cadastro de obras, edições, cotações e ofertas.</p></div><span className="pill pill-warning">Acesso de desenvolvimento</span></div>
    <div className="notice"><AlertTriangle size={16} style={{display:"inline",verticalAlign:"middle",marginRight:7,color:"#e8c46b"}}/><strong>Importante:</strong> este painel inicial não executa gravações nem representa autenticação administrativa de produção. Configure Supabase Auth, autorização no servidor e RLS antes de disponibilizar operações administrativas.</div>
    <div className="stats-grid">
      <div className="stat-card"><span className="stat-icon"><Database size={20}/></span><div><small>Modo de dados</small><strong style={{fontSize:15}}>{local ? "Local vazio" : "Supabase"}</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><BookOpen size={20}/></span><div><small>Obras</small><strong>0</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><ShieldCheck size={20}/></span><div><small>Autenticação</small><strong style={{fontSize:15}}>Não configurada</strong></div></div>
    </div>
    <div className="section-head"><div><h2>Áreas de gerenciamento</h2><p>O catálogo pode ser organizado gradualmente.</p></div></div>
    <div className="admin-grid">
      <div className="panel"><h2><BookOpen size={17} style={{display:"inline",verticalAlign:"middle",marginRight:8}}/>Obras e edições</h2><p className="muted">Cadastre título e autor como campos mínimos; capas e informações adicionais podem ser preenchidas depois.</p><Link href="/mangas" className="button">Ver catálogo</Link></div>
      <div className="panel"><h2><TrendingUp size={17} style={{display:"inline",verticalAlign:"middle",marginRight:8}}/>Cotações</h2><p className="muted">Somente coleções usadas completas são válidas. Os registros detalhados serão restritos à administração.</p><Link href="/quotations" className="button">Ver cotações</Link></div>
      <div className="panel"><h2><Tag size={17} style={{display:"inline",verticalAlign:"middle",marginRight:8}}/>Ofertas</h2><p className="muted">Rascunhos, publicação manual, evidência de preço anterior e expiração serão validados no servidor.</p><Link href="/offers" className="button">Ver ofertas</Link></div>
      <div className="panel"><h2><ShieldCheck size={17} style={{display:"inline",verticalAlign:"middle",marginRight:8}}/>Próximo passo</h2><p className="muted">Leia o README para instalar o projeto e configurar o Supabase com políticas RLS antes de ativar gravações.</p><a className="button" href="https://github.com/plpa12/MangaTrack">Abrir repositório</a></div>
    </div>
  </div>;
}