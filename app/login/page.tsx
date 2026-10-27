import Link from "next/link";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  return <div>
    <div className="page-heading"><div><span className="eyebrow">ACESSO RESTRITO</span><h1>Login administrativo</h1><p>A autenticação de produção depende da configuração do Supabase Auth.</p></div></div>
    <div className="notice"><AlertTriangle size={16} style={{display:"inline",verticalAlign:"middle",marginRight:7,color:"#e8c46b"}}/><strong>Login ainda não ativado.</strong> Esta página não aceita credenciais nem simula autenticação. Configure Supabase Auth, callback de sessão, autorização no servidor e políticas RLS antes de liberar acesso administrativo.</div>
    <div className="empty-state"><span className="empty-icon"><ShieldCheck size={20}/></span><h3>Autenticação pendente de configuração</h3><p>Por segurança, não foi criado um login improvisado. O cadastro público de usuários deve permanecer desativado; o primeiro administrador deve ser provisionado por um procedimento privado e confiável.</p><Link href="/admin" className="button">Voltar ao painel informativo</Link></div>
  </div>;
}