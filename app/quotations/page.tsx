import { AlertCircle } from "lucide-react";
import { dataRepository } from "@/lib/data";
import QuotationExplorer from "./quotation-explorer";
import { buildPublicQuotationTrends, countPublicQuotationValues, summarizePublicQuotationValues } from "@/lib/quotation-statistics";

export default async function QuotationsPage() {
  const [mangas, editions, publicQuotationValues] = await Promise.all([dataRepository.listManga(), dataRepository.listEditions(), dataRepository.listPublicQuotationValues()]);
  const publicTrends = buildPublicQuotationTrends(publicQuotationValues);
  const observationCounts = Object.fromEntries(countPublicQuotationValues(publicQuotationValues).map(({editionId,observationCount}) => [editionId,observationCount]));
  const trends = editions.map((edition) => {
    const daily = publicTrends.filter(row => row.editionId === edition.id).map(row => ({
      dateLabel: new Intl.DateTimeFormat("pt-BR", {day:"2-digit",month:"2-digit",year:"2-digit"}).format(new Date(row.observedDay+"T12:00:00Z")),
      priceCents: row.averagePriceCents, observationCount: row.observationCount
    }));
    return {editionId:edition.id, summary:summarizePublicQuotationValues(publicQuotationValues,edition.id), daily};
  });
  return <div>
    <div className="page-heading"><div><span className="eyebrow">HISTÓRICO DE PREÇOS</span><h1>Cotações</h1><p>Acompanhe a evolução de preços de coleções usadas completas, sempre separadas por edição.</p></div></div>
    <div className="notice"><strong>Como funciona:</strong> apenas coleções completas entram nos cálculos. A média é calculada por edição; bom preço é até 90% da média e ótimo preço é até 80%. Valores indicativos com base apenas nos registros cadastrados.</div>
    <QuotationExplorer mangas={mangas.map(({id,title}) => ({id,title}))} editions={editions.map(({id,mangaId,name}) => ({id,mangaId,name}))} trends={trends} observationCounts={observationCounts} quotationValues={publicQuotationValues}/>
    <div className="notice" style={{marginTop:14}}><AlertCircle size={15} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>Valores de cotações elegíveis são públicos. Links de anúncios e observações privadas não são exibidos. O gráfico apresenta a média das cotações de cada dia. Links de anúncios e observações privadas não são exibidos.</div>
  </div>;
}
