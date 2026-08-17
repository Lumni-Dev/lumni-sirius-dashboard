"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "error";

// Gera um link publico de 1 hora e o exibe num painel com botao de copiar.
export default function ShareButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setStatus("loading");
    setCopied(false);
    setLink(null);
    try {
      const res = await fetch("/api/share", { method: "POST" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as { url?: string };
      if (!data?.url) throw new Error("resposta sem url");
      setLink(data.url);
      setStatus("idle");
      void copy(data.url);
    } catch {
      setStatus("error");
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Copia automatica pode falhar (sem permissao/HTTP): o usuario copia manualmente.
      setCopied(false);
    }
  }

  function close() {
    setLink(null);
    setStatus("idle");
    setCopied(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={generate}
        disabled={status === "loading"}
        className="rounded-lg border border-border bg-elevated px-3 py-1.5 text-xs font-medium text-muted transition hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Gerando..." : "Compartilhar"}
      </button>

      {status === "error" ? (
        <p className="absolute right-0 z-30 mt-2 w-64 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted">
          Nao foi possivel gerar o link agora. Tente novamente em instantes.
        </p>
      ) : null}

      {link ? (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-lg border border-border bg-surface p-3 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-faint">
              Link de compartilhamento
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Fechar"
              className="text-muted transition hover:text-text"
            >
              &times;
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-md border border-border bg-elevated px-2 py-1.5 text-xs text-text outline-none"
            />
            <button
              type="button"
              onClick={() => copy(link)}
              className="shrink-0 rounded-md border border-border bg-accent px-2.5 py-1.5 text-xs font-semibold text-on-accent transition hover:opacity-90"
            >
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            Qualquer pessoa com este link ve suas metricas, sem login. Expira em 1 hora.
          </p>
        </div>
      ) : null}
    </div>
  );
}
