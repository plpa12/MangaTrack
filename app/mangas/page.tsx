"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { localData } from "@/lib/data/local";

export default function MangasPage() {
  const [query, setQuery] = useState("");
  const mangas = useMemo(() => localData.listManga(query), [query]);
  return <div>
    <div className="page-heading"><div><span className="eyebrow">BIBLIOTECA</span><h1>Catálogo de mangás</h1><p>Obras cadastradas no MangaTrack, com suas edições e informações editoriais.</p></div></div>
    <div className="toolbar"><label className="search-box"><Search size={17}/><span className="sr-only">Pesquisar por título ou título alternativo</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por título ou título alternativo..." /></label><span className="results-count">{mangas.length} obras</span></div>
    <div className="notice">O catálogo está vazio por padrão. A pesquisa considera títulos principais e alternativos cadastrados; nenhuma obra fictícia é inserida automaticamente.</div>
    {mangas.length === 0 && <div className="empty-state"><span className="empty-icon"><BookOpen size={20}/></span><h3>{query ? "Nenhum resultado encontrado" : "Seu catálogo começa aqui"}</h3><p>{query ? "Tente outro título ou confira a grafia." : "Quando as obras forem cadastradas pelo painel administrativo, elas aparecerão nesta página."}</p>{query && <button className="button" onClick={() => setQuery("")}>Limpar pesquisa</button>}{!query && <Link href="/admin" className="button">Ir ao painel administrativo</Link>}</div>}
  </div>;
}