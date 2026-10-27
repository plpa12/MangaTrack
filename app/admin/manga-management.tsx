"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Archive, Save } from "lucide-react";
import { archiveMangaAction, updateMangaAction, type MangaActionState } from "./actions";
import type { Manga } from "@/lib/types";

const initialState: MangaActionState = { message: "", success: false };

function Result({ state }: { state: MangaActionState }) {
  return state.message ? <p className={state.success ? "form-message form-message-success" : "form-message"} role="status">{state.message}</p> : null;
}

function MangaItem({ manga }: { manga: Manga }) {
  const [editState, editAction, editPending] = useActionState(updateMangaAction, initialState);
  const [archiveState, archiveAction, archivePending] = useActionState(archiveMangaAction, initialState);
  const router = useRouter();
  useEffect(() => { if (editState.success || archiveState.success) router.refresh(); }, [editState.success, archiveState.success, router]);
  return <details className="panel" style={{ marginBottom: 12 }}>
    <summary style={{ cursor: "pointer", fontWeight: 650, padding: 4 }}>{manga.title} <span className="muted">— {manga.author}</span></summary>
    <form action={editAction} className="admin-form" style={{ marginTop: 16 }}>
      <input type="hidden" name="id" value={manga.id}/>
      <div className="form-grid">
        <div className="field"><label htmlFor={`edit-title-${manga.id}`}>Título *</label><input id={`edit-title-${manga.id}`} name="title" required maxLength={180} defaultValue={manga.title}/></div>
        <div className="field"><label htmlFor={`edit-author-${manga.id}`}>Autor *</label><input id={`edit-author-${manga.id}`} name="author" required maxLength={180} defaultValue={manga.author}/></div>
        <div className="field"><label htmlFor={`edit-cover-${manga.id}`}>URL da capa</label><input id={`edit-cover-${manga.id}`} name="coverUrl" type="url" defaultValue={manga.coverUrl ?? ""}/></div>
        <div className="field"><label htmlFor={`edit-status-${manga.id}`}>Status</label><select id={`edit-status-${manga.id}`} name="publicationStatus" defaultValue={manga.publicationStatus}><option value="unknown">Não informado</option><option value="ongoing">Em publicação</option><option value="completed">Finalizado</option><option value="hiatus">Hiato</option></select></div>
        <div className="field"><label htmlFor={`edit-alt-${manga.id}`}>Títulos alternativos (um por linha)</label><textarea id={`edit-alt-${manga.id}`} name="alternativeTitles" rows={2} defaultValue={manga.alternativeTitles.join("\n")}/></div>
        <div className="field"><label htmlFor={`edit-chapters-${manga.id}`}>Capítulos</label><input id={`edit-chapters-${manga.id}`} name="chapterCount" type="number" min="0" step="1" defaultValue={manga.chapterCount ?? ""}/></div>
        <div className="field"><label htmlFor={`edit-volumes-${manga.id}`}>Volumes originais</label><input id={`edit-volumes-${manga.id}`} name="originalVolumeCount" type="number" min="0" step="1" defaultValue={manga.originalVolumeCount ?? ""}/></div>
        <div className="field" style={{ gridColumn: "1 / -1" }}><label htmlFor={`edit-synopsis-${manga.id}`}>Sinopse</label><textarea id={`edit-synopsis-${manga.id}`} name="synopsis" rows={3} maxLength={10000} defaultValue={manga.synopsis ?? ""}/></div>
      </div>
      <button className="button button-primary" type="submit" disabled={editPending}><Save size={15}/>{editPending ? "Salvando..." : "Salvar alterações"}</button>
      <Result state={editState}/>
    </form>
    <form action={archiveAction} className="admin-form" style={{ marginTop: 14 }}>
      <input type="hidden" name="id" value={manga.id}/>
      <button className="button" type="submit" disabled={archivePending}><Archive size={15}/>{archivePending ? "Arquivando..." : "Arquivar obra"}</button>
      <span className="field-hint">Arquivar oculta a obra do catálogo sem apagar o registro.</span>
      <Result state={archiveState}/>
    </form>
  </details>;
}

export default function MangaManagement({ mangas }: { mangas: Manga[] }) {
  if (!mangas.length) return <div className="empty-small">Nenhuma obra cadastrada para editar ou arquivar.</div>;
  return <div>{mangas.map((manga) => <MangaItem key={manga.id} manga={manga}/>)}</div>;
}
