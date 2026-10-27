import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Layers3, Tag } from "lucide-react";
import { dataRepository } from "@/lib/data";
import { formatBRL, sortPublicOffers, summarizeQuotations } from "@/lib/money";

export default async function MangaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const manga = await dataRepository.getManga(id);
  if (!manga) notFound();
  const [editions, allOffers] = await Promise.all([
    dataRepository.listEditions(manga.id),
    dataRepository.listOffers()
  ]);
  const editionSummaries = await Promise.all(editions.map(async (edition) => ({
    edition,
    summary: summarizeQuotations(await dataRepository.listQuotations(edition.id))
  })));
  const offers = sortPublicOffers(allOffers).filter((offer) => offer.mangaId === manga.id || editions.some((edition) => edition.id === offer.editionId));
  return <div>
    <Link href="/mangas" className="section-link"><ArrowLeft size={14} style={{display:"inline",verticalAlign:"middle",marginRight:6}}/>Voltar ao catálogo</Link>
    <div className="manga-detail-layout">
      <div>{manga.coverUrl ? <img className="manga-detail-cover" src={manga.coverUrl} alt={`Capa de ${manga.title}`}/> : <div className="manga-detail-fallback"><BookOpen size={30}/></div>}</div>
      <div><span className="eyebrow">DETALHES DA OBRA</span><h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:"clamp(27px,3vw,38px)",margin:"8px 0"}}>{manga.title}</h1><p className="muted">{manga.author}</p>
        {manga.alternativeTitles.length > 0 && <p className="muted">Também conhecido como: {manga.alternativeTitles.join(", ")}</p>}
        {manga.synopsis && <section className="panel" style={{marginTop:18}}><h2>Sinopse</h2><p className="muted" style={{lineHeight:1.7}}>{manga.synopsis}</p></section>}
      </div>
    </div>
    <section><div className="section-head"><div><h2>Edições cadastradas</h2><p>As edições e seus históricos são acompanhados separadamente.</p></div></div>
      {editions.length === 0 ? <div className="empty-state"><span className="empty-icon"><Layers3 size={20}/></span><h3>Nenhuma edição cadastrada</h3><p>Esta obra pode existir no catálogo mesmo antes de receber edições, cotações ou ofertas.</p></div> :
        <div className="admin-list">{editionSummaries.map(({edition,summary}) => <div className="admin-item" key={edition.id}><div><strong>{edition.name}</strong><small>{edition.publisher || "Editora não informada"} · {edition.format || "Formato não informado"} · {summary.observationCount} cotações · média {formatBRL(summary.averageCents)}</small></div><Link className="button" href="/quotations">Ver histórico</Link></div>)}</div>}
    </section>
    <section><div className="section-head"><div><h2>Ofertas relacionadas</h2><p>Promoções publicadas e ainda válidas para esta obra.</p></div><Link href="/offers" className="section-link">Ver todas as ofertas</Link></div>
      {offers.length === 0 ? <div className="empty-state"><span className="empty-icon"><Tag size={20}/></span><h3>Nenhuma oferta relacionada</h3><p>Quando houver promoções válidas associadas a esta obra, elas serão mostradas aqui.</p></div> :
        <div className="offer-grid">{offers.map((offer) => <article className="offer-card" key={offer.id}>{offer.imageUrl ? <img className="offer-image" src={offer.imageUrl} alt="" loading="lazy"/> : <div className="offer-image offer-image-placeholder"><Tag size={24}/></div>}<div className="offer-card-body"><span className="pill">{offer.store}</span><h2>{offer.title}</h2><div className="offer-prices"><strong>{formatBRL(offer.promotionalPriceCents)}</strong>{offer.discountPercent !== null && offer.previousPriceCents && <><span className="offer-old-price">{formatBRL(offer.previousPriceCents)}</span><span className="discount-pill">-{offer.discountPercent.toLocaleString("pt-BR")}%</span></>}</div><a className="button button-primary offer-open" href={offer.affiliateUrl || offer.productUrl} target="_blank" rel="noopener noreferrer">Ver oferta</a></div></article>)}</div>}
    </section>
    <div className="notice"><BookOpen size={15} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>Os dados desta página vêm do modo de desenvolvimento atual e não são persistidos.</div>
  </div>;
}
