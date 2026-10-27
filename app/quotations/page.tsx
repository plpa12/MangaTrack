import { AlertCircle } from "lucide-react";
import { localData } from "@/lib/data/local";
import QuotationExplorer from "./quotation-explorer";

export default function QuotationsPage() {
  const mangas = localData.listManga();
  const editions = localData.listEditions();
  const quotations = localData.listQuotations();
  return <div>
    <div className="page-heading"><div><span className="eyebrow">HISTÓRICO DE PREÇOS</span><h1>Cotações</h1><p>Acompanhe a evolução de preços de coleções usadas completas, sempre separadas por edição.</p></div></div>
    <div className="notice"><strong>Como funciona:</strong> apenas coleções completas entram nos cálculos. A média é calculada por edição; bom preço é até 90% da média e ótimo preço é até 80%. Valores indicativos com base apenas nos registros cadastrados.</div>
    <QuotationExplorer mangas={mangas} editions={editions} quotations={quotations}/>
    <div className="notice" style={{marginTop:14}}><AlertCircle size={15} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>Os anúncios individuais e seus links não são expostos nesta página pública; apenas os preços agregados e a evolução temporal são mostrados.</div>
  </div>;
}
