import Link from "next/link";
import { ArrowRight, BookOpen, Search, Tag, TrendingUp } from "lucide-react";
import { localData } from "@/lib/data/local";

export default function HomePage() {
  const mangas = localData.listManga();
  const offers = localData.listOffers();
  return <div>
    <section className="hero"><div className="hero-content">
      <span className="eyebrow">SEU RADAR DE MANGÁS</span>
      <h1>Encontre sua próxima leitura. <span className="red">Acompanhe cada preço.</span></h1>
      <p>Um lugar para consultar edições, acompanhar cotações de coleções usadas completas e encontrar ofertas de mangás novos.</p>
      <Link href="/mangas" className="button button-primary">Explorar catálogo <ArrowRight size={16}/></Link>
    </div><div className="hero-ghost" aria-hidden="true">漫</div></section>
    <section className="stats-grid" aria-label="Resumo do catálogo">
      <div className="stat-card"><span className="stat-icon"><BookOpen size={20}/></span><div><small>Obras cadastradas</small><strong>{mangas.length}</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><TrendingUp size={20}/></span><div><small>Cotações registradas</small><strong>0</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><Tag size={20}/></span><div><small>Ofertas ativas</small><strong>{offers.length}</strong></div></div>
    </section>
    <section><div className="section-head"><div><h2>Cotações atualizadas</h2><p>Histórico de coleções usadas completas por edição.</p></div><Link href="/quotations" className="section-link">Ver cotações <ArrowRight size={13} style={{display:"inline",verticalAlign:"middle"}}/></Link></div>
      <div className="empty-state"><span className="empty-icon"><TrendingUp size={20}/></span><h3>As primeiras cotações aparecerão aqui</h3><p>Quando o administrador cadastrar observações válidas, você verá médias e tendências de preço por edição.</p></div>
    </section>
    <section><div className="section-head"><div><h2>Mais pesquisados</h2><p>Obras mais abertas pelos visitantes.</p></div><Link href="/mangas" className="section-link">Ver mangás <ArrowRight size={13} style={{display:"inline",verticalAlign:"middle"}}/></Link></div>
      <div className="empty-state"><span className="empty-icon"><Search size={20}/></span><h3>Nenhuma obra no catálogo ainda</h3><p>O catálogo começa vazio para evitar informações fictícias. As obras cadastradas serão exibidas aqui.</p><Link href="/mangas" className="button">Abrir catálogo</Link></div>
    </section>
    <section><div className="section-head"><div><h2>Ofertas em destaque</h2><p>Promoções publicadas e ainda válidas.</p></div><Link href="/offers" className="section-link">Ver ofertas <ArrowRight size={13} style={{display:"inline",verticalAlign:"middle"}}/></Link></div>
      <div className="empty-state"><span className="empty-icon"><Tag size={20}/></span><h3>Nenhuma oferta publicada</h3><p>Ofertas só aparecem depois de verificadas e publicadas pelo administrador.</p></div>
    </section>
  </div>;
}