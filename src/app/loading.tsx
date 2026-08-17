import DashboardSkeleton from "@/components/DashboardSkeleton";

// Fallback de Suspense do App Router: aparece automaticamente enquanto o
// page.tsx (Server Component) busca as metricas no engine.
export default function Loading() {
  return <DashboardSkeleton showAccount />;
}
