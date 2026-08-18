"use client";

import { useEffect } from "react";

/** Bloqueia o menu de contexto (botao direito) e o arrasto de imagens na pagina.
 * A selecao de texto e bloqueada por CSS (user-select: none); aqui vai o que o
 * CSS nao cobre, mais o selectstart como reforco em navegadores antigos. */
export function LockPage() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const block = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("selectstart", block);

    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("selectstart", block);
    };
  }, []);

  return null;
}
