import DashboardSkeleton from "@/components/DashboardSkeleton";

// Fallback de Suspense da visao publica: sem bloco "Conta" e com o header no
// modo somente-leitura, igual ao SharedDashboardPage.
export default function Loading() {
  return <DashboardSkeleton showAccount={false} readOnly />;
}
