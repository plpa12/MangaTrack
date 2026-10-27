"use client";
import { useMemo, useState } from "react";
import { ExternalLink, Tag } from "lucide-react";
import { formatBRL, sortPublicOffers } from "@/lib/money";
import type { Offer, ProductType } from "@/lib/types";

const types: { value: ProductType | "all"; label: string }[] = [
  { value: "all", label: "Todos os tipos" }, { value: "volume", label: "Volume individual" },
  { value: "box_set", label: "Box / coleção" }, { value: "special_edition", label: "Edição especial" },
  { value: "omnibus", label: "Omnibus / deluxe" }, { value: "other", label: "Outro" }
];
const typeLabel = (type: ProductType) => types.find((item) => item.value === type)?.label ?? "Outro";

export default function OffersClient({ initialOffers }: { initialOffers: Offer[] }) {
  const [type, setType] = useState<ProductType | "all">("all");
  const [store, setStore] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const offers = useMemo(() => sortPublicOffers(initialOffers).filter((o) =>
    (type === "all" || o.productType === type) &&
    (!store.trim() || o.store.toLocaleLowerCase("pt-BR").includes(store.trim().toLocaleLowerCase("pt-BR"))) &&
    (!maxPrice || o.promotionalPriceCents <= Math.round(Number(maxPrice) * 100))
  ), [initialOffers, type, store, maxPrice]);
  return <div>
    <div className="page-heading"><div><span className="eyebrow">PROMOÇÕES VERIFICADAS</span><h1>Ofertas</h1><p>Promoções de mangás novos, com filtros combináveis por tipo, loja e faixa de preço.</p></div></div>
    <div className="offer-filters">
      <label className="field"><span>Tipo de produto</span><select aria-label="Tipo de produto" value={type} onChange={(e) => setType(e.target.value as ProductType | "all")}>{types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
      <label className="field"><span>Loja</span><input aria-label="Loja" value={store} onChange={(e) => setStore(e.target.value)} placeholder="Filtrar por loja..."/></label>
      <label className="field"><span>Preço máximo (R$)</span><input aria-label="Preço máximo em reais" inputMode="decimal" type="number" min="0" step="0.01" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Qualquer preço"/></label>
    </div>
    <div className="toolbar"><span className="results-count">{offers.length} ofertas disponíveis</span><button className="button" onClick={() => {setType("all");setStore("");setMaxPrice("");}}>Limpar filtros</button></div>
    {offers.length > 0 && <div className="offer-grid">{offers.map((offer) => <article className="offer-card" key={offer.id}>
      {offer.imageUrl ? <img className="offer-image" src={offer.imageUrl} alt="" loading="lazy"/> : <div className="offer-image offer-image-placeholder"><Tag size={24}/></div>}
      <div className="offer-card-body"><span className="pill">{typeLabel(offer.productType)}</span><h2>{offer.title}</h2><p className="muted">{offer.store}</p>
        <div className="offer-prices"><strong>{formatBRL(offer.promotionalPriceCents)}</strong>{offer.previousPriceConfirmed && offer.previousPriceCents && offer.discountPercent !== null && <><span className="offer-old-price">{formatBRL(offer.previousPriceCents)}</span><span className="discount-pill">-{offer.discountPercent.toLocaleString("pt-BR")}%</span></>}</div>
        <p className="field-hint">Verificada em {new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium"}).format(new Date(offer.verifiedAt))}{offer.expiresAt ? " · válida até "+new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium"}).format(new Date(offer.expiresAt)) : ""}</p>
        <a className="button button-primary offer-open" href={offer.affiliateUrl || offer.productUrl} target="_blank" rel="noopener noreferrer">Ver oferta <ExternalLink size={14}/></a>
      </div>
    </article>)}</div>}
    {offers.length === 0 && <div className="empty-state"><span className="empty-icon"><Tag size={20}/></span><h3>Nenhuma oferta disponível</h3><p>{initialOffers.length ? "Nenhuma oferta publicada corresponde aos filtros selecionados." : "Ofertas em rascunho, desativadas ou expiradas não aparecem publicamente. Quando uma promoção for verificada e publicada, ela será listada aqui."}</p>{(type !== "all" || store || maxPrice) && <button className="button" onClick={() => {setType("all");setStore("");setMaxPrice("");}}>Limpar filtros</button>}</div>}
  </div>;
}
