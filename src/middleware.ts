import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  // Protege tudo, menos login, rotas de auth, assets do _next e arquivos
  // estaticos (qualquer caminho com extensao, ex.: .ico, .png, .svg).
  matcher: ["/((?!login|api/auth|_next|.*\\..*).*)"],
};
