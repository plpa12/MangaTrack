import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Layers3, Tag } from "lucide-react";
import { localData } from "@/lib/data/local";

export default async function MangaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const manga = localData.getManga(id);
  if (!manga) notFound();
  const editions = localData.listEditions(manga.id);
  return <div>
    <Link href="/mangas" className="section-link"><ArrowLeft size={14} style={{display:"inline",verticalAlign:"middle",marginRight:6}}/>Voltar ao catálogo</Link>
    <div className="page-heading" style={{marginTop:24}}><div><span className="eyebrow">DETALHES DA OBRA</span><h1>{manga.title}</h1><p>{manga.author}</p></div></div>
    {manga.synopsis && <section className="panel"><h2>Sinopse</h2><p className="muted">{manga.synopsis}</p></section>}
    <section><div className="section-head"><div><h2>Edições cadastradas</h2><p>As edições e seus históricos são acompanhados separadamente.</p></div></div>
      {editions.length === 0 ? <div className="empty-state"><span className="empty-icon"><Layers3 size={20}/></span><h3>Nenhuma edição cadastrada</h3><p>Esta obra pode existir no catálogo mesmo antes de receber edições, cotações ou ofertas.</p></div> :
        <div className="admin-list">{editions.map((edition) => <div className="admin-item" key={edition.id}><div><strong>{edition.name}</strong><small>{edition.publisher || "Editora não informada"} · {edition.format || "Formato não informado"}</small></div><Link className="button" href="/quotations">Cotações</Link></div>)}</div>}
    </section>
    <section><div className="section-head"><div><h2>Ofertas relacionadas</h2><p>Promoções publicadas para esta obra.</p></div><Link href="/offers" className="section-link">Ver ofertas</Link></div>
      <div className="empty-state"><span className="empty-icon"><Tag size={20}/></span><h3>Nenhuma oferta relacionada</h3><p>Quando houver promoções válidas associadas a esta obra, elas serão mostradas aqui.</p></div>
    </section>
    <div className="notice"><BookOpen size={15} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>Os dados desta página vêm do modo de desenvolvimento atual e não são persistidos.</div>
  </div>;
}