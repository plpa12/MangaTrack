import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, Home, Tag, TrendingUp } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MangaTrack — Mangás, cotações e ofertas",
  description: "Acompanhe edições, cotações de coleções usadas completas e ofertas de mangás.",
  applicationName: "MangaTrack"
};

const links = [
  { href: "/", label: "Início", icon: Home },
  { href: "/mangas", label: "Mangás", icon: BookOpen },
  { href: "/quotations", label: "Cotações", icon: TrendingUp },
  { href: "/offers", label: "Ofertas", icon: Tag }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const localMode = process.env.MANGATRACK_DATA_MODE !== "supabase" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <Link href="/" className="brand" aria-label="MangaTrack, início">
              <span className="brand-mark"><Activity size={22} strokeWidth={2.6} /></span>
              <span>Manga<span className="brand-accent">Track</span><small>SEU RADAR DE MANGÁS</small></span>
            </Link>
            <p className="nav-caption">MENU PRINCIPAL</p>
            <nav className="main-nav" aria-label="Navegação principal">
              {links.map(({ href, label, icon: Icon }) => (
                <Link href={href} className="nav-link" key={href}><Icon size={18} /><span>{label}</span></Link>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <span className="sidebar-dot" />
              <div><strong>MangaTrack</strong><small>Projeto em desenvolvimento</small></div>
              <Link href="/admin" className="admin-shortcut" aria-label="Painel administrativo">↗</Link>
            </div>
          </aside>
          <div className="main-column">
            <header className="topbar">
              <span className="breadcrumb">MANGATRACK <span>/</span> ACOMPANHAMENTO DE MANGÁS</span>
              <Link href="/admin" className="admin-link">Painel administrativo <span>↗</span></Link>
            </header>
            {localMode && <div className="dev-banner"><span /> MODO DE DESENVOLVIMENTO — dados temporários; nada é salvo permanentemente.</div>}
            <main className="content">{children}</main>
            <footer className="footer"><span>© {new Date().getFullYear()} MangaTrack</span><span>Preços cadastrados pela comunidade administrativa · valores em R$</span></footer>
          </div>
        </div>
      </body>
    </html>
  );
}