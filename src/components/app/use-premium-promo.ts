"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "learnix:premium-promo-dismissed";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function isDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    // Modo privado ou storage bloqueado: trata como não dispensada.
    return false;
  }
}

/**
 * Controla a oferta de Premium na sidebar. Só pode ser dispensada uma vez:
 * depois disso não volta a aparecer neste navegador.
 *
 * O localStorage é uma fonte externa ao React, então é lido via
 * useSyncExternalStore. No servidor não há como saber se já foi dispensada;
 * o snapshot do servidor devolve `true` (dispensada) para que a oferta nunca
 * apareça na marcação inicial e depois suma para quem já a fechou.
 */
export function usePremiumPromo(isPremium: boolean) {
  const dismissed = useSyncExternalStore(
    subscribe,
    isDismissed,
    () => true, // snapshot do servidor
  );

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Sem persistência não há o que fazer — o card volta no próximo load.
    }
    listeners.forEach((l) => l());
  }, []);

  return { visible: !isPremium && !dismissed, dismiss };
}
