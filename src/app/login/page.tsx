import GoogleSignInButton from "@/components/GoogleSignInButton";
import Starfield from "@/components/Starfield";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams?.error;
  const message =
    error === "AccessDenied"
      ? "Esta conta Google ainda nao e um usuario do Sirius."
      : error
        ? "Nao foi possivel entrar. Tente novamente."
        : null;

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <Starfield />
      <div className="card w-full max-w-sm text-center">
        <div className="font-brand text-3xl font-bold uppercase tracking-[0.1em] text-text">
          Sirius
        </div>
        <h1 className="mt-1 font-brand text-xs font-semibold uppercase tracking-[0.35em] text-faint">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted">
          Entre com a mesma conta Google que voce usa no Sirius para ver as suas
          metricas de uso.
        </p>
        <GoogleSignInButton />
        {message ? <p className="mt-4 text-sm text-danger">{message}</p> : null}
      </div>
    </main>
  );
}
