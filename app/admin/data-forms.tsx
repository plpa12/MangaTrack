"use client";
import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { createEditionAction, createOfferAction, createQuotationAction, type MangaActionState } from "./actions";
import type { Edition, Manga } from "@/lib/types";

const initialState: MangaActionState = { message: "", success: false };

function localDateTimeValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function TimezoneOffsetField() {
  const [offset, setOffset] = useState(0);
  useEffect(() => setOffset(new Date().getTimezoneOffset()), []);
  return <input type="hidden" name="timezoneOffsetMinutes" value={offset} readOnly />;
}

function DateTimeLocalInput({ id, name, required = false, initialIso, defaultNow = false }: {
  id: string; name: string; required?: boolean; initialIso?: string | null; defaultNow?: boolean;
}) {
  const [value, setValue] = useState("");
  useEffect(() => {
    if (initialIso) {
      const date = new Date(initialIso);
      setValue(Number.isNaN(date.getTime()) ? "" : localDateTimeValue(date));
    } else {
      setValue(defaultNow ? localDateTimeValue(new Date()) : "");
    }
  }, [initialIso, defaultNow]);
  return <input id={id} name={name} type="datetime-local" required={required} value={value} onChange={(event) => setValue(event.target.value)} />;
}
function Status({ state }: { state: MangaActionState }) {
  return state.message ? <p className={state.success ? "form-message form-message-success" : "form-message"} role="status">{state.message}</p> : null;
}
function EditionOptions({ editions }: { editions: Edition[] }) {
  return editions.map((edition) => <option key={edition.id} value={edition.id}>{edition.name}</option>);
}

export function EditionForm({ mangas }: { mangas: Manga[] }) {
  const [state, action, pending] = useActionState(createEditionAction, initialState);
  if (!mangas.length) return <div className="empty-small">Cadastre uma obra antes de adicionar uma edição.</div>;
  return <form action={action} className="admin-form">\n    <TimezoneOffsetField/>
    <div className="field"><label htmlFor="edition-manga">Obra *</label><select id="edition-manga" name="mangaId" required defaultValue=""><option value="" disabled>Selecione uma obra</option>{mangas.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>
    <div className="form-grid">
      <div className="field"><label htmlFor="edition-name">Nome da edição *</label><input id="edition-name" name="name" required maxLength={180} placeholder="Ex.: Edição brasileira, volume 1"/></div>
      <div className="field"><label htmlFor="edition-publisher">Editora</label><input id="edition-publisher" name="publisher" maxLength={180}/></div>
      <div className="field"><label htmlFor="edition-format">Formato</label><input id="edition-format" name="format" maxLength={100} placeholder="Tankōbon, kanzenban, box..."/></div>
      <div className="field"><label htmlFor="edition-isbn">ISBN</label><input id="edition-isbn" name="isbn" maxLength={32}/></div>
      <div className="field"><label htmlFor="edition-volumes">Volumes físicos nesta edição</label><input id="edition-volumes" name="physicalVolumeCount" type="number" min="1" step="1"/></div>
      <div className="field"><label htmlFor="edition-notes">Observações</label><input id="edition-notes" name="notes" maxLength={5000}/></div>
    </div>
    <button className="button button-primary" type="submit" disabled={pending}><Plus size={15}/>{pending ? "Salvando..." : "Cadastrar edição"}</button><Status state={state}/>
  </form>;
}

export function QuotationForm({ editions }: { editions: Edition[] }) {
  const [state, action, pending] = useActionState(createQuotationAction, initialState);
  if (!editions.length) return <div className="empty-small">Cadastre uma edição antes de registrar uma cotação.</div>;
  return <form action={action} className="admin-form">\n    <TimezoneOffsetField/>
    <div className="field"><label htmlFor="quotation-edition">Edição *</label><select id="quotation-edition" name="editionId" required defaultValue=""><option value="" disabled>Selecione uma edição</option><EditionOptions editions={editions}/></select></div>
    <div className="form-grid">
      <div className="field"><label htmlFor="quotation-price">Preço da coleção completa (R$) *</label><input id="quotation-price" name="price" type="number" min="0.01" max="1000000" step="0.01" required placeholder="150,00"/></div>
      <div className="field"><label htmlFor="quotation-date">Data observada *</label><DateTimeLocalInput id="quotation-date" name="observedAt" required defaultNow/></div>
      <div className="field"><label htmlFor="quotation-url">Link do anúncio</label><input id="quotation-url" name="listingUrl" type="url" placeholder="https://..."/></div>
      <div className="field"><label htmlFor="quotation-condition">Condição / observações</label><input id="quotation-condition" name="conditionNotes" maxLength={5000} placeholder="Estado de conservação, itens inclusos..."/></div>
    </div>
    <label className="field" style={{display:"flex",alignItems:"center",gridTemplateColumns:"auto 1fr",gap:9}}><input name="collectionComplete" type="checkbox" required style={{width:16}}/>Confirmo que o preço se refere à coleção completa desta edição.</label>
    <button className="button button-primary" type="submit" disabled={pending}><Plus size={15}/>{pending ? "Registrando..." : "Registrar cotação"}</button><Status state={state}/>
  </form>;
}

export function OfferForm({ mangas, editions }: { mangas: Manga[]; editions: Edition[] }) {
  const [state, action, pending] = useActionState(createOfferAction, initialState);
  return <form action={action} className="admin-form">\n    <TimezoneOffsetField/>
    <div className="form-grid">
      <div className="field"><label htmlFor="offer-title">Título do produto *</label><input id="offer-title" name="title" required maxLength={220} placeholder="Nome do volume, box ou edição"/></div>
      <div className="field"><label htmlFor="offer-store">Loja *</label><input id="offer-store" name="store" required maxLength={120}/></div>
      <div className="field"><label htmlFor="offer-type">Tipo de produto *</label><select id="offer-type" name="productType" defaultValue="volume"><option value="volume">Volume individual</option><option value="box_set">Box / coleção</option><option value="special_edition">Edição especial</option><option value="omnibus">Omnibus / deluxe</option><option value="other">Outro</option></select></div>
      <div className="field"><label htmlFor="offer-manga">Obra relacionada</label><select id="offer-manga" name="mangaId" defaultValue=""><option value="">Nenhuma</option>{mangas.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>
      <div className="field"><label htmlFor="offer-edition">Edição relacionada</label><select id="offer-edition" name="editionId" defaultValue=""><option value="">Nenhuma</option><EditionOptions editions={editions}/></select></div>
      <div className="field"><label htmlFor="offer-price">Preço promocional (R$) *</label><input id="offer-price" name="promotionalPrice" type="number" min="0.01" step="0.01" required/></div>
      <div className="field"><label htmlFor="offer-prev-price">Preço anterior (R$)</label><input id="offer-prev-price" name="previousPrice" type="number" min="0.01" step="0.01"/></div>
      <div className="field"><label htmlFor="offer-prev-evidence">Evidência do preço anterior</label><input id="offer-prev-evidence" name="previousPriceEvidence" type="url" placeholder="Link ou captura arquivada https://..."/></div>
      <div className="field"><label htmlFor="offer-product-url">Link do produto *</label><input id="offer-product-url" name="productUrl" type="url" required placeholder="https://..."/></div>
      <div className="field"><label htmlFor="offer-affiliate">Link afiliado (opcional)</label><input id="offer-affiliate" name="affiliateUrl" type="url" placeholder="https://..."/></div>
      <div className="field"><label htmlFor="offer-image">URL da imagem (opcional)</label><input id="offer-image" name="imageUrl" type="url" placeholder="https://..."/></div>
      <div className="field"><label htmlFor="offer-verified">Verificada em *</label><DateTimeLocalInput id="offer-verified" name="verifiedAt" required defaultNow/></div>
      <div className="field"><label htmlFor="offer-expiry">Expira em (opcional)</label><DateTimeLocalInput id="offer-expiry" name="expiresAt"/></div>
      <div className="field"><label htmlFor="offer-status">Status *</label><select id="offer-status" name="status" defaultValue="draft"><option value="draft">Rascunho</option><option value="published">Publicada</option><option value="disabled">Desativada</option><option value="expired">Expirada</option></select></div>
    </div>
    <label className="field" style={{display:"flex",alignItems:"center",gridTemplateColumns:"auto 1fr",gap:9}}><input name="previousPriceConfirmed" type="checkbox" style={{width:16}}/>Confirmo o preço anterior com evidência verificável.</label>
    <p className="field-hint">O desconto só será exibido quando o preço anterior estiver confirmado, for maior que o promocional e tiver evidência. Oferta publicada exige link válido.</p>
    <button className="button button-primary" type="submit" disabled={pending}><Plus size={15}/>{pending ? "Salvando..." : "Cadastrar oferta"}</button><Status state={state}/>
  </form>;
}
