import { AlertCircle } from "lucide-react";
import { localData } from "@/lib/data/local";
import { summarizeQuotations } from "@/lib/money";
import QuotationExplorer from "./quotation-explorer";

export default function QuotationsPage() {
  const mangas = localData.listManga();
  const editions = localData.listEditions();
  const trends = editions.map((edition) => {
    const quotations = localData.listQuotations(edition.id);
    const dailyBuckets = new Map<string, { totalCents: number; count: number }>();
    for (const quotation of quotations) {
      const day = quotation.observedAt.slice(0, 10);
      const bucket = dailyBuckets.get(day) ?? { totalCents: 0, count: 0 };
      bucket.totalCents += quotation.priceCents;
      bucket.count += 1;
      dailyBuckets.set(day, bucket);
    }
    return {
      editionId: edition.id,
      summary: summarizeQuotations(quotations),
      daily: [...dailyBuckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, bucket]) => ({
        dateLabel: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(day + "T12:00:00Z")),
        priceCents: Math.round(bucket.totalCents / bucket.count),
        observationCount: bucket.count
      }))
    };
  });
  return <div>
    <div className="page-heading"><div><span className="eyebrow">HISTÓRICO DE PREÇOS</span><h1>Cotações</h1><p>Acompanhe a evolução de preços de coleções usadas completas, sempre separadas por edição.</p></div></div>
    <div className="notice"><strong>Como funciona:</strong> apenas coleções completas entram nos cálculos. A média é calculada por edição; bom preço é até 90% da média e ótimo preço é até 80%. Valores indicativos com base apenas nos registros cadastrados.</div>
    <QuotationExplorer mangas={mangas.map(({id,title}) => ({id,title}))} editions={editions.map(({id,mangaId,name}) => ({id,mangaId,name}))} trends={trends}/>
    <div className="notice" style={{marginTop:14}}><AlertCircle size={15} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>Anúncios individuais, links e observações privadas não são enviados para a interface pública. O gráfico apresenta médias diárias agregadas.</div>
  </div>;
}
