"use client";

import {
  createContext,
  useCallback,
  useContext,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// Compartilha o estado de "trocando periodo" entre o RangeFilter (que dispara a
// navegacao) e o PendingOverlay (que aplica o shimmer sobre os dados). Como a
// troca roda dentro de startTransition, o Next mantem o dashboard atual visivel
// em vez de mostrar o loading.tsx a cada clique.
type RangeTransition = {
  isPending: boolean;
  navigate: (href: string) => void;
};

const RangeTransitionContext = createContext<RangeTransition | null>(null);

export function useRangeTransition(): RangeTransition {
  const ctx = useContext(RangeTransitionContext);
  if (!ctx) {
    throw new Error(
      "useRangeTransition precisa estar dentro de RangeTransitionProvider",
    );
  }
  return ctx;
}

export function RangeTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href, { scroll: false });
      });
    },
    [router],
  );

  return (
    <RangeTransitionContext.Provider value={{ isPending, navigate }}>
      {children}
    </RangeTransitionContext.Provider>
  );
}

// Envolve a area de dados: enquanto a troca de periodo esta pendente, esmaece o
// conteudo atual e passa um brilho suave por cima.
export function PendingOverlay({ children }: { children: ReactNode }) {
  const { isPending } = useRangeTransition();
  return (
    <div className="relative" aria-busy={isPending}>
      <div
        className={
          "transition-opacity duration-200 " + (isPending ? "opacity-55" : "")
        }
      >
        {children}
      </div>
      {isPending ? <div className="pending-sweep" /> : null}
    </div>
  );
}
