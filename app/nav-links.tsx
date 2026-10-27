"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Tag, TrendingUp } from "lucide-react";

const links = [
  { href: "/", label: "Início", icon: Home },
  { href: "/mangas", label: "Mangás", icon: BookOpen },
  { href: "/quotations", label: "Cotações", icon: TrendingUp },
  { href: "/offers", label: "Ofertas", icon: Tag }
];
export default function NavLinks() {
  const pathname = usePathname();
  return <nav className="main-nav" aria-label="Navegação principal">
    {links.map(({ href, label, icon: Icon }) => {
      const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
      return <Link href={href} className={active ? "nav-link nav-link-active" : "nav-link"} aria-current={active ? "page" : undefined} key={href}><Icon size={18}/><span>{label}</span></Link>;
    })}
  </nav>;
}
