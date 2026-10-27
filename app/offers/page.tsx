"use client";
import { useMemo, useState } from "react";
import { Tag } from "lucide-react";
import { localData } from "@/lib/data/local";
import { sortPublicOffers } from "@/lib/money";
import type { ProductType } from "@/lib/types";

const types: { value: ProductType | "all"; label: string }[] = [
  { value: "all", label: "Todos os tipos" }, { value: "volume", label: "Volume individual" },
  { value: "box_set", label: "Box / coleção" }, { value: "special_edition", label: "Edição especial" },
  { value: "omnibus", label: "Omnibus / deluxe" }, { value: "other", label: "Outro" }
];

export default function OffersPage() {
  const [type, setType] = useState<ProductType | "all">("all");
  const [store, setStore] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const offers = useMemo(() => sortPublicOffers(localData.listOffers()).filter((o) =>
    (type === "all" || o.productType === type) &&
    (!store.trim() || o.store.toLocaleLowerCase("pt-BR").includes(store.trim().toLocaleLowerCase("pt-BR"))) &&
    (!maxPrice || o.promotionalPriceCents <= Math.round(Number(maxPrice) * 100))
  ), [type, store, maxPrice]);
  return <div>
    <div className="page-heading"><div><span className="eyebrow">PROMOÇÕES VERIFICADAS</span><h1>Ofertas</h1><p>Promoções de mangás novos, com filtros combináveis por tipo, loja e faixa de preço.</p></div></div>
    <div className="offer-filters">
      <label className="field"><span className="sr-only">Tipo de produto</span><select aria-label="Tipo de produto" value={type} onChange={(e) => setType(e.target.value as ProductType | "all")}>{types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
      <label className="field"><span className="sr-only">Loja</span><input aria-label="Loja" value={store} onChange={(e) => setStore(e.target.value)} placeholder="Filtrar por loja..." /></label>
      <label className="field"><span className="sr-only">Preço máximo em reais</span><input aria-label="Preço máximo em reais" inputMode="decimal" type="number" min="0" step="0.01" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Preço máximo (R$)" /></label>
    </div>
    <div className="toolbar"><span className="results-count">{offers.length} ofertas encontradas</span><button className="button" onClick={() => {setType("all");setStore("");setMaxPrice("");}}>Limpar filtros</button></div>
    {offers.length === 0 && <div className="empty-state"><span className="empty-icon"><Tag size={20}/></span><h3>Nenhuma oferta disponível</h3><p>Ofertas em rascunho, desativadas ou expiradas não aparecem publicamente. Quando uma promoção for verificada e publicada, ela será listada aqui.</p></div>}
  </div>;
}