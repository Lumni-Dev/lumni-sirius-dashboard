import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  // Protege tudo, menos login, rotas de auth, o link publico de compartilhamento
  // (/shared), assets do _next e arquivos estaticos (qualquer caminho com
  // extensao, ex.: .ico, .png, .svg). A rota /api/share segue protegida.
  matcher: ["/((?!login|shared|api/auth|_next|.*\\..*).*)"],
};
