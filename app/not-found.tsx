import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return <div className="empty-state" style={{marginTop:50}}>
    <span className="empty-icon"><Search size={20}/></span>
    <span className="eyebrow">ERRO 404</span>
    <h3>Página não encontrada</h3>
    <p>Esse endereço não existe ou a obra ainda não está disponível no catálogo.</p>
    <Link href="/mangas" className="button button-primary"><ArrowLeft size={15}/> Voltar aos mangás</Link>
  </div>;
}