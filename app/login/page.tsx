import Link from "next/link";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { loginAction } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const messages: Record<string, string> = {
    missing: "Informe e-mail e senha.",
    invalid: "E-mail ou senha inválidos.",
    "not-admin": "Esta conta não tem autorização administrativa.",
    "not-configured": "O Supabase ainda não está configurado.",
  };
  return <div>
    <div className="page-heading"><div><span className="eyebrow">ACESSO RESTRITO</span><h1>Login administrativo</h1><p>Entre com a conta de administrador criada no Supabase Auth.</p></div></div>
    {params.error && <div className="notice"><AlertTriangle size={16} style={{display:"inline",verticalAlign:"middle",marginRight:7,color:"#e8c46b"}}/>{messages[params.error] ?? "Não foi possível entrar."}</div>}
    {params.message === "signed-out" && <div className="notice">Você saiu da sessão administrativa.</div>}
    <div className="panel" style={{maxWidth:520,margin:"24px auto"}}>
      <div className="empty-icon"><ShieldCheck size={20}/></div>
      <h2>Entrar no MangaTrack</h2>
      <p className="muted">Somente usuários com a permissão administrativa definida em <code>app_metadata</code> podem acessar o painel.</p>
      <form action={loginAction} className="form-stack">
        <label className="field"><span>E-mail</span><input name="email" type="email" autoComplete="username" required maxLength={254}/></label>
        <label className="field"><span>Senha</span><input name="password" type="password" autoComplete="current-password" required maxLength={256}/></label>
        <button className="button button-primary" type="submit">Entrar</button>
      </form>
    </div>
    <div className="notice"><strong>Segurança:</strong> o cadastro público está desativado. O primeiro administrador precisa ser criado pelo procedimento privado do Supabase e receber a permissão <code>mangatrack_admin=true</code> em <code>app_metadata</code>.</div>
    <Link href="/" className="section-link">Voltar ao início</Link>
  </div>;
}
