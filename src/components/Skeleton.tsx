// Bloco de carregamento reutilizavel. Puramente visual (sem estado), entao pode
// rodar como Server Component e ser usado direto no loading.tsx.
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}
