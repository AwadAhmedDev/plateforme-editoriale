"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Widget Cloudflare Turnstile, rendu explicitement (le rendu implicite ne voit pas les
// formulaires montés après une navigation côté client). À placer DANS le <form> : le
// widget y injecte le champ caché `cf-turnstile-response`, lu par verifyTurnstile.
// Mode « interaction-only » : invisible pour la plupart des visiteurs.
// `resetSignal` : passer l'état de l'action — un jeton est à usage unique, il faut en
// redemander un après chaque soumission refusée.
export function TurnstileWidget({ resetSignal, className }: { resetSignal?: unknown; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  function renderWidget() {
    if (!SITE_KEY || !window.turnstile || !containerRef.current || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      appearance: "interaction-only",
      language: "fr",
    });
  }

  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
  }, [resetSignal]);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderWidget}
      />
      <div ref={containerRef} className={className} />
    </>
  );
}
