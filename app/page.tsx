import Link from "next/link";
import { ArrowRight, BookOpen, Search, Tag, TrendingUp } from "lucide-react";
import { localData } from "@/lib/data/local";
import { formatBRL, sortPublicOffers, summarizeQuotations } from "@/lib/money";

export default function HomePage() {
  const mangas = localData.listManga();
  const offers = sortPublicOffers(localData.listOffers()).slice(0, 3);
  const editions = localData.listEditions();
  const quotations = localData.listQuotations();
  const recentMangas = [...mangas].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const mangaById = new Map(mangas.map((manga) => [manga.id, manga]));
  const quotationSummaries = editions.map((edition) => ({ edition, manga: mangaById.get(edition.mangaId), summary: summarizeQuotations(quotations.filter((quote) => quote.editionId === edition.id)) })).filter((row) => row.summary.observationCount > 0).sort((a,b) => (b.summary.latestObservedAt ?? "").localeCompare(a.summary.latestObservedAt ?? "")).slice(0, 4);
  return <div>
    <section className="hero"><div className="hero-content">
      <span className="eyebrow">SEU RADAR DE MANGÁS</span>
      <h1>Encontre sua próxima leitura. <span className="red">Acompanhe cada preço.</span></h1>
      <p>Um lugar para consultar edições, acompanhar cotações de coleções usadas completas e encontrar ofertas de mangás novos.</p>
      <Link href="/mangas" className="button button-primary">Explorar catálogo <ArrowRight size={16}/></Link>
    </div><div className="hero-ghost" aria-hidden="true">漫</div></section>
    <section className="stats-grid" aria-label="Resumo do catálogo">
      <div className="stat-card"><span className="stat-icon"><BookOpen size={20}/></span><div><small>Obras cadastradas</small><strong>{mangas.length}</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><TrendingUp size={20}/></span><div><small>Cotações registradas</small><strong>{quotations.length}</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><Tag size={20}/></span><div><small>Ofertas ativas</small><strong>{sortPublicOffers(localData.listOffers()).length}</strong></div></div>
    </section>
    <section><div className="section-head"><div><h2>Cotações atualizadas</h2><p>Histórico de coleções usadas completas por edição.</p></div><Link href="/quotations" className="section-link">Ver cotações <ArrowRight size={13} style={{display:"inline",verticalAlign:"middle"}}/></Link></div>
      {quotationSummaries.length ? <div className="admin-list">{quotationSummaries.map(({edition,manga,summary}) => <div className="admin-item" key={edition.id}><div><strong>{manga?.title ?? "Obra"} — {edition.name}</strong><small>{summary.observationCount} observações · atualizado em {summary.latestObservedAt ? new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium"}).format(new Date(summary.latestObservedAt)) : "—"}</small></div><strong>{formatBRL(summary.averageCents)}</strong></div>)}</div> : <div className="empty-state"><span className="empty-icon"><TrendingUp size={20}/></span><h3>As primeiras cotações aparecerão aqui</h3><p>Quando houver observações válidas, você verá médias e tendências de preço por edição.</p></div>}
    </section>
    <section><div className="section-head"><div><h2>Mais pesquisados</h2><p>Obras cadastradas no catálogo.</p></div><Link href="/mangas" className="section-link">Ver mangás <ArrowRight size={13} style={{display:"inline",verticalAlign:"middle"}}/></Link></div>
      {recentMangas.length ? <div className="manga-grid">{recentMangas.map((manga) => <Link className="manga-card" href={`/mangas/${manga.id}`} key={manga.id}>{manga.coverUrl ? <img className="manga-cover" src={manga.coverUrl} alt={`Capa de ${manga.title}`} loading="lazy"/> : <div className="cover-placeholder"><BookOpen size={25}/></div>}<strong>{manga.title}</strong><span>{manga.author}</span></Link>)}</div> : <div className="empty-state"><span className="empty-icon"><Search size={20}/></span><h3>Nenhuma obra no catálogo ainda</h3><p>O catálogo começa vazio para evitar informações fictícias. As obras cadastradas serão exibidas aqui.</p><Link href="/mangas" className="button">Abrir catálogo</Link></div>}
    </section>
    <section><div className="section-head"><div><h2>Ofertas em destaque</h2><p>Promoções publicadas e ainda válidas.</p></div><Link href="/offers" className="section-link">Ver ofertas <ArrowRight size={13} style={{display:"inline",verticalAlign:"middle"}}/></Link></div>
      {offers.length ? <div className="offer-grid">{offers.map((offer) => <article className="offer-card" key={offer.id}>{offer.imageUrl ? <img className="offer-image" src={offer.imageUrl} alt="" loading="lazy"/> : <div className="offer-image offer-image-placeholder"><Tag size={24}/></div>}<div className="offer-card-body"><span className="pill">{offer.store}</span><h2>{offer.title}</h2><div className="offer-prices"><strong>{formatBRL(offer.promotionalPriceCents)}</strong>{offer.discountPercent !== null && offer.previousPriceCents && <span className="discount-pill">-{offer.discountPercent.toLocaleString("pt-BR")}%</span>}</div><a className="button button-primary offer-open" href={offer.affiliateUrl || offer.productUrl} target="_blank" rel="noopener noreferrer">Ver oferta</a></div></article>)}</div> : <div className="empty-state"><span className="empty-icon"><Tag size={20}/></span><h3>Nenhuma oferta publicada</h3><p>Ofertas só aparecem depois de verificadas, publicadas e ainda válidas.</p></div>}
    </section>
  </div>;
}
