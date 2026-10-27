"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Archive, RotateCcw } from "lucide-react";
import { setQuotationArchivedAction, type MangaActionState } from "./actions";
import type { Edition, Manga, Quotation } from "@/lib/types";
import { formatBRL } from "@/lib/money";

const initialState: MangaActionState = { message: "", success: false };
function Result({ state }: { state: MangaActionState }) {
  return state.message ? <p className={state.success ? "form-message form-message-success" : "form-message"} role="status">{state.message}</p> : null;
}
function QuotationItem({ quotation, edition, manga }: { quotation: Quotation; edition?: Edition; manga?: Manga }) {
  const [state, action, pending] = useActionState(setQuotationArchivedAction, initialState);
  const router = useRouter();
  useEffect(() => { if (state.success) router.refresh(); }, [state.success, router]);
  return <div className="panel" style={{ marginBottom: 10, opacity: quotation.archived ? 0.72 : 1 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div>
        <strong>{manga?.title ?? "Obra arquivada ou desconhecida"} — {edition?.name ?? "Edição desconhecida"}</strong>
        <p className="muted" style={{ margin: "6px 0" }}>{formatBRL(quotation.priceCents)} · {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(quotation.observedAt))}</p>
        {quotation.listingUrl ? <a href={quotation.listingUrl} target="_blank" rel="noreferrer" className="text-link">Abrir anúncio de origem</a> : null}
        {quotation.conditionNotes ? <p className="muted">{quotation.conditionNotes}</p> : null}
        {quotation.archived ? <span className="pill pill-warning">Arquivada</span> : null}
      </div>
      <form action={action}>
        <input type="hidden" name="id" value={quotation.id}/>
        <input type="hidden" name="archived" value={String(!quotation.archived)}/>
        <button className="button" type="submit" disabled={pending}>{quotation.archived ? <RotateCcw size={15}/> : <Archive size={15}/ >}{pending ? "Salvando..." : quotation.archived ? "Restaurar" : "Arquivar"}</button>
        <Result state={state}/>
      </form>
    </div>
  </div>;
}
export default function QuotationManagement({ quotations, editions, mangas }: { quotations: Quotation[]; editions: Edition[]; mangas: Manga[] }) {
  if (!quotations.length) return <div className="empty-small">Nenhuma cotação cadastrada para gerenciar.</div>;
  const sorted = [...quotations].sort((a, b) => b.observedAt.localeCompare(a.observedAt));
  return <div>{sorted.map((quotation) => {
    const edition = editions.find((item) => item.id === quotation.editionId);
    return <QuotationItem key={quotation.id} quotation={quotation} edition={edition} manga={mangas.find((item) => item.id === edition?.mangaId)}/>;
  })}</div>;
}
