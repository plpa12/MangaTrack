"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { updateOfferAction, type MangaActionState } from "./actions";
import type { Offer } from "@/lib/types";

const initialState: MangaActionState = { message: "", success: false };
const labels: Record<Offer["status"], string> = { draft: "Rascunho", published: "Publicada", disabled: "Desativada", expired: "Expirada" };
function Result({ state }: { state: MangaActionState }) {
  return state.message ? <p className={state.success ? "form-message form-message-success" : "form-message"} role="status">{state.message}</p> : null;
}
function localDateTimeValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function TimezoneOffsetField() {
  const [offset, setOffset] = useState(0);
  useEffect(() => setOffset(new Date().getTimezoneOffset()), []);
  return <input type="hidden" name="timezoneOffsetMinutes" value={offset} readOnly />;
}
function LocalExpiryInput({ id, initialIso }: { id: string; initialIso: string | null }) {
  const [value, setValue] = useState("");
  useEffect(() => {
    if (!initialIso) { setValue(""); return; }
    const date = new Date(initialIso);
    setValue(Number.isNaN(date.getTime()) ? "" : localDateTimeValue(date));
  }, [initialIso]);
  return <input id={id} name="expiresAt" type="datetime-local" value={value} onChange={(event) => setValue(event.target.value)} />;
}
function OfferItem({ offer }: { offer: Offer }) {
  const [state, action, pending] = useActionState(updateOfferAction, initialState);
  const router = useRouter();
  useEffect(() => { if (state.success) router.refresh(); }, [state.success, router]);
  return <details className="panel" style={{ marginBottom: 12 }}>
    <summary style={{ cursor: "pointer", fontWeight: 650, padding: 4 }}>{offer.title} <span className="muted">— {offer.store} · {labels[offer.status]}</span></summary>
    <form action={action} className="admin-form" style={{ marginTop: 12 }}>
      <input type="hidden" name="id" value={offer.id}/>\n      <TimezoneOffsetField/>
      <div className="form-grid">
        <div className="field"><label htmlFor={`offer-title-${offer.id}`}>Título *</label><input id={`offer-title-${offer.id}`} name="title" required maxLength={220} defaultValue={offer.title}/></div>
        <div className="field"><label htmlFor={`offer-store-${offer.id}`}>Loja *</label><input id={`offer-store-${offer.id}`} name="store" required maxLength={120} defaultValue={offer.store}/></div>
        <div className="field"><label htmlFor={`offer-price-${offer.id}`}>Preço promocional (R$) *</label><input id={`offer-price-${offer.id}`} name="promotionalPrice" type="number" min="0.01" step="0.01" required defaultValue={(offer.promotionalPriceCents / 100).toFixed(2)}/></div>
        <div className="field"><label htmlFor={`offer-url-${offer.id}`}>Link do produto *</label><input id={`offer-url-${offer.id}`} name="productUrl" type="url" required defaultValue={offer.productUrl}/></div>
        <div className="field"><label htmlFor={`offer-expiry-${offer.id}`}>Expira em</label><LocalExpiryInput id={`offer-expiry-${offer.id}`} initialIso={offer.expiresAt}/></div>
        <div className="field"><label htmlFor={`offer-status-${offer.id}`}>Status</label><select id={`offer-status-${offer.id}`} name="status" defaultValue={offer.status}><option value="draft">Rascunho</option><option value="published">Publicada</option><option value="disabled">Desativada</option><option value="expired">Expirada</option></select></div>
      </div>
      <p className="field-hint">O desconto só é exibido quando o preço anterior foi confirmado com evidência. Ofertas publicadas precisam permanecer válidas.</p>
      <button className="button button-primary" type="submit" disabled={pending}><Save size={15}/>{pending ? "Salvando..." : "Salvar alterações"}</button>
      <Result state={state}/>
    </form>
  </details>;
}
export default function OfferManagement({ offers }: { offers: Offer[] }) {
  if (!offers.length) return <div className="empty-small">Nenhuma oferta cadastrada para gerenciar.</div>;
  return <div>{offers.map((offer) => <OfferItem key={offer.id} offer={offer}/>)}</div>;
}
