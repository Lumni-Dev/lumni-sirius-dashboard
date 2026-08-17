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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sirius-logo.png" alt="Sirius" className="mx-auto h-14 w-14" />
        <h1 className="mt-3 font-brand text-lg font-semibold uppercase tracking-[0.2em]">
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
