"use client";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBRL } from "@/lib/money";
import { getQuotationAvailability } from "@/lib/quotation-visibility";
import type { PriceSummary } from "@/lib/types";

type EditionOption = { id: string; mangaId: string; name: string };
type MangaOption = { id: string; title: string };
type DailyPoint = { dateLabel: string; priceCents: number; observationCount: number };
type EditionTrend = { editionId: string; summary: PriceSummary; daily: DailyPoint[] };

export default function QuotationExplorer({
  mangas,
  editions,
  trends,
  observationCounts
}: {
  mangas: MangaOption[];
  editions: EditionOption[];
  trends: EditionTrend[];
  observationCounts: Record<string, number>;
}) {
  const [editionId, setEditionId] = useState(editions[0]?.id ?? "all");
  const mangaMap = useMemo(() => new Map(mangas.map((manga) => [manga.id, manga])), [mangas]);
  const trendMap = useMemo(() => new Map(trends.map((trend) => [trend.editionId, trend])), [trends]);
  const selectedTrend = editionId === "all" ? null : trendMap.get(editionId) ?? null;
  const selectedObservationCount = editionId === "all" ? 0 : observationCounts[editionId] ?? 0;
  const totalObservations = editions.reduce((sum, edition) => sum + (observationCounts[edition.id] ?? 0), 0);
  const chartData = selectedTrend?.daily.map((point) => ({
    dateLabel: point.dateLabel,
    price: point.priceCents / 100,
    observationCount: point.observationCount
  })) ?? [];
  const availability = getQuotationAvailability(selectedObservationCount, chartData.length > 0);

  return <div>
    <div className="toolbar">
      <label className="field" style={{flex:1}}>
        <span>Selecione uma edição para ver a tendência</span>
        <select aria-label="Filtrar cotações por edição" value={editionId} onChange={(event) => setEditionId(event.target.value)}>
          <option value="all">Selecione uma edição…</option>
          {editions.map((edition) => <option key={edition.id} value={edition.id}>{mangaMap.get(edition.mangaId)?.title ?? "Obra"} — {edition.name}</option>)}
        </select>
      </label>
      <span className="results-count">{editionId === "all" ? totalObservations : selectedObservationCount} observações</span>
    </div>

    {editionId !== "all" && availability === "available" && selectedTrend && <>
      <div className="stats-grid">
        <div className="stat-card"><div><small>Média da edição</small><strong>{formatBRL(selectedTrend.summary.averageCents)}</strong></div></div>
        <div className="stat-card"><div><small>Bom preço (até 90%)</small><strong>{formatBRL(selectedTrend.summary.goodPriceCents)}</strong></div></div>
        <div className="stat-card"><div><small>Ótimo preço (até 80%)</small><strong>{formatBRL(selectedTrend.summary.greatPriceCents)}</strong></div></div>
      </div>
      {selectedTrend.summary.limitedSample && <div className="notice" style={{marginTop:14}}>Amostra limitada: há menos de 5 observações agregadas. Use a média como referência indicativa, não como preço garantido de mercado.</div>}
      <div className="panel chart-panel">
        <h2>Média diária das cotações</h2>
        <p className="muted">Cada ponto agrega os preços observados no mesmo dia. Anúncios e registros individuais não são enviados para a interface pública.</p>
        <div style={{width:"100%",height:300,marginTop:18}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{top:8,right:18,bottom:8,left:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2b2e37"/>
              <XAxis dataKey="dateLabel" stroke="#9297a3" tick={{fontSize:11}}/>
              <YAxis stroke="#9297a3" tick={{fontSize:11}} tickFormatter={(value:number) => "R$ "+value}/>
              <Tooltip contentStyle={{background:"#15171d",border:"1px solid #383b46",borderRadius:8,color:"#f4f4f5"}} formatter={(value) => [formatBRL(typeof value === "number" ? Math.round(value*100) : null), "Média diária"]} labelFormatter={(label) => String(label)}/>
              <Line type="monotone" dataKey="price" stroke="#ed3446" strokeWidth={2} dot={{r:4,fill:"#ed3446"}} activeDot={{r:6}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>}

    {editionId === "all" && <div className="empty-state">
      <span className="empty-icon">↗</span>
      <h3>Selecione uma edição</h3>
      <p>A média e o histórico são calculados separadamente para cada edição, para não misturar coleções diferentes.</p>
    </div>}
    {editionId !== "all" && availability === "none" && <div className="empty-state">
      <span className="empty-icon">↗</span>
      <h3>Ainda não há cotações para esta edição</h3>
      <p>Nenhuma cotação elegível de coleção completa está cadastrada para esta edição.</p>
    </div>}
    {editionId !== "all" && availability === "insufficient" && <div className="empty-state">
      <span className="empty-icon">↗</span>
      <h3>Há cotações, mas ainda não há dados públicos suficientes</h3>
      <p>Existem {selectedObservationCount} cotações elegíveis para esta edição. Para proteger a privacidade, preços e médias diárias só aparecem quando um mesmo dia tem pelo menos três registros. Até lá, os valores indicativos e o gráfico permanecem ocultos.</p>
    </div>}
  </div>;
}
