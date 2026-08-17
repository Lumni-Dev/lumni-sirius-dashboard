import GoogleSignInButton from "@/components/GoogleSignInButton";

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
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="card w-full max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-accent font-brand text-xl font-black text-on-accent">
          S
        </div>
        <h1 className="text-xl font-bold tracking-tight">Sirius Dashboard</h1>
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
