import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getMetrics } from "@/lib/metrics";
import { normalizeRange } from "@/lib/range";
import DashboardView from "@/components/DashboardView";
import ShareButton from "@/components/ShareButton";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) redirect("/login");

  const sub = session?.googleSub ?? "";
  const range = normalizeRange(searchParams?.range);

  let metrics;
  try {
    metrics = await getMetrics(email, sub, range);
  } catch (err) {
    console.error("[dashboard] engine indisponivel:", err);
    return (
      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="card text-center text-sm text-muted">
          Nao foi possivel carregar os dados agora. O engine esta indisponivel —
          tente novamente em instantes.
        </div>
      </main>
    );
  }

  return (
    <DashboardView
      metrics={metrics}
      range={range}
      basePath="/"
      showAccount
      headerActions={
        <>
          <ShareButton />
          <div className="flex items-center gap-2">
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt=""
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-lg border border-border"
              />
            ) : null}
            <span className="hidden text-xs text-muted sm:block">{email}</span>
          </div>
          <SignOutButton />
        </>
      }
    />
  );
}
