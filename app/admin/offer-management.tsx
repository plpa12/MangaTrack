"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { updateOfferStatusAction, type MangaActionState } from "./actions";
import type { Offer } from "@/lib/types";

const initialState: MangaActionState = { message: "", success: false };
const labels: Record<Offer["status"], string> = {
  draft: "Rascunho",
  published: "Publicada",
  disabled: "Desativada",
  expired: "Expirada"
};
function Result({ state }: { state: MangaActionState }) {
  return state.message ? <p className={state.success ? "form-message form-message-success" : "form-message"} role="status">{state.message}</p> : null;
}
function OfferItem({ offer }: { offer: Offer }) {
  const [state, action, pending] = useActionState(updateOfferStatusAction, initialState);
  const router = useRouter();
  useEffect(() => { if (state.success) router.refresh(); }, [state.success, router]);
  return <details className="panel" style={{ marginBottom: 12 }}>
    <summary style={{ cursor: "pointer", fontWeight: 650, padding: 4 }}>
      {offer.title} <span className="muted">— {offer.store} · {labels[offer.status]}</span>
    </summary>
    <p className="muted" style={{ marginTop: 12 }}>Preço: {(offer.promotionalPriceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
    <form action={action} className="admin-form" style={{ marginTop: 12 }}>
      <input type="hidden" name="id" value={offer.id}/>
      <div className="field">
        <label htmlFor={`offer-status-${offer.id}`}>Status da oferta</label>
        <select id={`offer-status-${offer.id}`} name="status" defaultValue={offer.status}>
          <option value="draft">Rascunho</option>
          <option value="published">Publicada</option>
          <option value="disabled">Desativada</option>
          <option value="expired">Expirada</option>
        </select>
      </div>
      <p className="field-hint">Publicar torna a oferta elegível para aparecer ao público, desde que passe pelas regras de validação.</p>
      <button className="button button-primary" type="submit" disabled={pending}><Save size={15}/>{pending ? "Atualizando..." : "Salvar status"}</button>
      <Result state={state}/>
    </form>
  </details>;
}
export default function OfferManagement({ offers }: { offers: Offer[] }) {
  if (!offers.length) return <div className="empty-small">Nenhuma oferta cadastrada para gerenciar.</div>;
  return <div>{offers.map((offer) => <OfferItem key={offer.id} offer={offer}/>)}</div>;
}
