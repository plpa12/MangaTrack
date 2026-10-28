"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Save } from "lucide-react";
import { archiveEditionAction, restoreEditionAction, updateEditionAction, type MangaActionState } from "./actions";
import type { Edition, Manga } from "@/lib/types";
const initialState: MangaActionState = { message: "", success: false };
function Result({ state }: { state: MangaActionState }) { return state.message ? <p className={state.success ? "form-message form-message-success" : "form-message"} role="status">{state.message}</p> : null; }
function EditionItem({ edition, mangas }: { edition: Edition; mangas: Manga[] }) {
  const [editState, editAction, editPending] = useActionState(updateEditionAction, initialState);
  const [archiveState, archiveAction, archivePending] = useActionState(archiveEditionAction, initialState);
  const router = useRouter();
  useEffect(() => { if (editState.success || archiveState.success) router.refresh(); }, [editState.success, archiveState.success, router]);
  return <details className="panel" style={{ marginBottom: 12 }}>
    <summary style={{ cursor: "pointer", fontWeight: 650, padding: 4 }}>{edition.name} <span className="muted">— {mangas.find((m) => m.id === edition.mangaId)?.title ?? "Obra desconhecida"}</span></summary>
    <form action={editAction} className="admin-form" style={{ marginTop: 16 }}><input type="hidden" name="id" value={edition.id}/>
      <div className="form-grid">
        <div className="field"><label htmlFor={`ed-manga-${edition.id}`}>Obra *</label><select id={`ed-manga-${edition.id}`} name="mangaId" required defaultValue={edition.mangaId}>{mangas.filter((m) => !m.archived).map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>
        <div className="field"><label htmlFor={`ed-name-${edition.id}`}>Nome *</label><input id={`ed-name-${edition.id}`} name="name" required maxLength={180} defaultValue={edition.name}/></div>
        <div className="field"><label htmlFor={`ed-pub-${edition.id}`}>Editora</label><input id={`ed-pub-${edition.id}`} name="publisher" maxLength={180} defaultValue={edition.publisher ?? ""}/></div>
        <div className="field"><label htmlFor={`ed-format-${edition.id}`}>Formato</label><input id={`ed-format-${edition.id}`} name="format" maxLength={100} defaultValue={edition.format ?? ""}/></div>
        <div className="field"><label htmlFor={`ed-isbn-${edition.id}`}>ISBN</label><input id={`ed-isbn-${edition.id}`} name="isbn" maxLength={32} defaultValue={edition.isbn ?? ""}/></div>
        <div className="field"><label htmlFor={`ed-volumes-${edition.id}`}>Volumes físicos</label><input id={`ed-volumes-${edition.id}`} name="physicalVolumeCount" type="number" min="1" step="1" defaultValue={edition.physicalVolumeCount ?? ""}/></div>
        <div className="field" style={{ gridColumn: "1 / -1" }}><label htmlFor={`ed-notes-${edition.id}`}>Observações</label><textarea id={`ed-notes-${edition.id}`} name="notes" rows={2} maxLength={5000} defaultValue={edition.notes ?? ""}/></div>
      </div>
      <button className="button button-primary" type="submit" disabled={editPending}><Save size={15}/>{editPending ? "Salvando..." : "Salvar edição"}</button><Result state={editState}/>
    </form>
    <form action={archiveAction} className="admin-form" style={{ marginTop: 14 }}><input type="hidden" name="id" value={edition.id}/><button className="button" type="submit" disabled={archivePending}><Archive size={15}/>{archivePending ? "Arquivando..." : "Arquivar edição"}</button><span className="field-hint">O registro e as cotações históricas não são apagados.</span><Result state={archiveState}/></form>
  </details>;
}
function ArchivedEditionItem({ edition, mangas }: { edition: Edition; mangas: Manga[] }) {
  const [state, action, pending] = useActionState(restoreEditionAction, initialState); const router = useRouter();
  useEffect(() => { if (state.success) router.refresh(); }, [state.success, router]);
  return <div className="panel" style={{ marginBottom: 12 }}><strong>{edition.name}</strong> <span className="muted">— {mangas.find((m) => m.id === edition.mangaId)?.title ?? "Obra desconhecida"}</span>
    <form action={action} className="admin-form" style={{ marginTop: 12 }}><input type="hidden" name="id" value={edition.id}/><button className="button button-primary" type="submit" disabled={pending}><ArchiveRestore size={15}/>{pending ? "Restaurando..." : "Desarquivar edição"}</button><Result state={state}/></form>
  </div>;
}
export default function EditionManagement({ editions, archivedEditions, mangas }: { editions: Edition[]; archivedEditions: Edition[]; mangas: Manga[] }) {
  const [view, setView] = useState<"active" | "archived">("active");
  return <div><div className="admin-form" style={{ marginBottom: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
    <button className={view === "active" ? "button button-primary" : "button"} type="button" onClick={() => setView("active")}>Edições ativas ({editions.length})</button>
    <button className={view === "archived" ? "button button-primary" : "button"} type="button" onClick={() => setView("archived")}>Edições arquivadas ({archivedEditions.length})</button>
  </div>
  {view === "active" ? (editions.length ? editions.map((e) => <EditionItem key={e.id} edition={e} mangas={mangas}/>) : <div className="empty-small">Nenhuma edição ativa para editar ou arquivar.</div>) : (archivedEditions.length ? archivedEditions.map((e) => <ArchivedEditionItem key={e.id} edition={e} mangas={mangas}/>) : <div className="empty-small">Nenhuma edição arquivada.</div>)}</div>;
}
