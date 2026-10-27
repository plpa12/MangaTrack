"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createMangaAction, type MangaActionState } from "./actions";

const initialState: MangaActionState = { message: "", success: false };

export default function MangaForm() {
  const [state, formAction, pending] = useActionState(createMangaAction, initialState);
  const router = useRouter();
  useEffect(() => { if (state.success) router.refresh(); }, [state.success, router]);
  return <form action={formAction} className="admin-form">
    <div className="form-grid">
      <div className="field"><label htmlFor="title">Título *</label><input id="title" name="title" required maxLength={180} placeholder="Título da obra"/></div>
      <div className="field"><label htmlFor="author">Autor *</label><input id="author" name="author" required maxLength={180} placeholder="Nome do autor"/></div>
      <div className="field"><label htmlFor="coverUrl">URL da capa (opcional)</label><input id="coverUrl" name="coverUrl" type="url" placeholder="https://..."/><span className="field-hint">A imagem precisa estar hospedada em um endereço público.</span></div>
      <div className="field"><label htmlFor="alternativeTitles">Títulos alternativos (opcional)</label><textarea id="alternativeTitles" name="alternativeTitles" rows={2} placeholder={"Um título por linha"}/></div>
      <div className="field"><label htmlFor="publicationStatus">Status de publicação</label><select id="publicationStatus" name="publicationStatus" defaultValue="unknown"><option value="unknown">Não informado</option><option value="ongoing">Em publicação</option><option value="completed">Finalizado</option><option value="hiatus">Hiato</option></select></div>
      <div className="field"><label htmlFor="chapterCount">Quantidade de capítulos (opcional)</label><input id="chapterCount" name="chapterCount" type="number" min="0" step="1" placeholder="Ex.: 120"/></div>
      <div className="field"><label htmlFor="originalVolumeCount">Volumes da edição original (opcional)</label><input id="originalVolumeCount" name="originalVolumeCount" type="number" min="0" step="1" placeholder="Ex.: 24"/></div>
      <div className="field" style={{gridColumn:"1 / -1"}}><label htmlFor="synopsis">Sinopse (opcional)</label><textarea id="synopsis" name="synopsis" rows={3} maxLength={10000} placeholder="Você pode preencher depois."/></div>
    </div>
    <div className="form-actions"><button className="button button-primary" type="submit" disabled={pending}><Plus size={15}/>{pending ? "Criando..." : "Cadastrar obra"}</button></div>
    {state.message && <p className={state.success ? "form-message form-message-success" : "form-message"} role="status">{state.message}</p>}
  </form>;
}
