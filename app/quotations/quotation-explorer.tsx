"use client";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBRL, summarizeQuotations } from "@/lib/money";
import type { Edition, Manga, Quotation } from "@/lib/types";

type Point = { id: string; editionId: string; editionName: string; mangaTitle: string; priceCents: number; observedAt: string };
export default function QuotationExplorer({ mangas, editions, quotations }: { mangas: Manga[]; editions: Edition[]; quotations: Quotation[] }) {
  const [editionId, setEditionId] = useState("all");
  const editionMap = useMemo(() => new Map(editions.map((edition) => [edition.id, edition])), [editions]);
  const mangaMap = useMemo(() => new Map(mangas.map((manga) => [manga.id, manga])), [mangas]);
  const points: Point[] = useMemo(() => quotations.flatMap((quotation) => {
    const edition = editionMap.get(quotation.editionId);
    if (!edition) return [];
    const manga = mangaMap.get(edition.mangaId);
    if (!manga) return [];
    return [{ id: quotation.id, editionId: edition.id, editionName: edition.name, mangaTitle: manga.title, priceCents: quotation.priceCents, observedAt: quotation.observedAt }];
  }).filter((point) => editionId === "all" || point.editionId === editionId).sort((a,b) => a.observedAt.localeCompare(b.observedAt)), [quotations, editionMap, mangaMap, editionId]);
  const selectedRows = quotations.filter((quotation) => editionId === "all" || quotation.editionId === editionId);
  const summary = summarizeQuotations(selectedRows);
  const chartData = points.map((point) => ({ ...point, dateLabel: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(point.observedAt)), price: point.priceCents / 100, label: point.mangaTitle + " · " + point.editionName }));
  return <div>
    <div className="toolbar"><label className="field" style={{flex:1}}><span>Filtrar por edição</span><select aria-label="Filtrar cotações por edição" value={editionId} onChange={(event) => setEditionId(event.target.value)}><option value="all">Todas as edições</option>{editions.map((edition) => <option key={edition.id} value={edition.id}>{mangaMap.get(edition.mangaId)?.title ?? "Obra"} — {edition.name}</option>)}</select></label><span className="results-count">{selectedRows.length} observações</span></div>
    <div className="stats-grid">
      <div className="stat-card"><div><small>Média das observações</small><strong>{formatBRL(summary.averageCents)}</strong></div></div>
      <div className="stat-card"><div><small>Bom preço (até 90%)</small><strong>{formatBRL(summary.goodPriceCents)}</strong></div></div>
      <div className="stat-card"><div><small>Ótimo preço (até 80%)</small><strong>{formatBRL(summary.greatPriceCents)}</strong></div></div>
    </div>
    {summary.limitedSample && selectedRows.length > 0 && <div className="notice" style={{marginTop:14}}>Amostra limitada: há menos de 5 observações. Use a média como referência indicativa, não como preço garantido de mercado.</div>}
    {chartData.length > 0 ? <div className="panel chart-panel"><h2>Histórico de preços</h2><p className="muted">Cada ponto representa uma cotação de coleção completa cadastrada no MangaTrack.</p><div style={{width:"100%",height:300,marginTop:18}}><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{top:8,right:18,bottom:8,left:4}}><CartesianGrid strokeDasharray="3 3" stroke="#2b2e37"/><XAxis dataKey="dateLabel" stroke="#9297a3" tick={{fontSize:11}}/><YAxis stroke="#9297a3" tick={{fontSize:11}} tickFormatter={(value:number) => "R$ "+value}/><Tooltip contentStyle={{background:"#15171d",border:"1px solid #383b46",borderRadius:8,color:"#f4f4f5"}} formatter={(value) => [formatBRL(typeof value === "number" ? Math.round(value*100) : null), "Preço"]} labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? "Cotação"}/><Line type="monotone" dataKey="price" stroke="#ed3446" strokeWidth={2} dot={{r:4,fill:"#ed3446"}} activeDot={{r:6}}/></LineChart></ResponsiveContainer></div></div> : <div className="empty-state"><span className="empty-icon">↗</span><h3>Ainda não há cotações cadastradas</h3><p>Registre uma cotação no painel administrativo. Só observações de coleções completas entram no cálculo e no gráfico.</p></div>}
  </div>;
}
