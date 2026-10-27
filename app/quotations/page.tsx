import Link from "next/link";
import { AlertCircle, TrendingUp } from "lucide-react";

export default function QuotationsPage() {
  return <div>
    <div className="page-heading"><div><span className="eyebrow">HISTÓRICO DE PREÇOS</span><h1>Cotações</h1><p>Acompanhe a evolução de preços de coleções usadas completas, sempre separadas por edição.</p></div></div>
    <div className="notice"><strong>Como funciona:</strong> apenas coleções completas entram nos cálculos. A média é calculada por edição; bom preço é até 90% da média e ótimo preço é até 80%.</div>
    <div className="empty-state"><span className="empty-icon"><TrendingUp size={20}/></span><h3>Ainda não há cotações cadastradas</h3><p>Quando houver observações válidas, esta página exibirá gráfico de preços, média, limites de referência e data da atualização. Os valores refletem apenas os registros do MangaTrack, não uma avaliação oficial de todo o mercado.</p><Link href="/mangas" className="button">Consultar catálogo</Link></div>
    <div className="notice" style={{marginTop:14}}><AlertCircle size={15} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>A lista individual de registros de preços é reservada ao painel administrativo. Visitantes verão apenas os resumos agregados.</div>
  </div>;
}