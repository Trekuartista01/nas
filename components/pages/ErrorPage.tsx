"use client";

import { useEffect } from "react";
import { GhostButton, SlashActionButton } from "@/components/ui/Buttons";
import StatusScreen from "@/components/ui/StatusScreen";

/**
 * Shown when something on a page crashes. In production Next.js hides the real error message
 * (it may contain private details); only the `digest` code is passed, which matches the server log.
 */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : undefined;

  useEffect(() => {
    // TODO: send to an error-reporting service once one is chosen.
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      word="GABIM"
      eyebrow="GABIM I PAPRITUR"
      lines={["SOMETHING", "WENT WRONG"]}
      text={
        <>
          <p>Faqja nuk u ngarkua si duhet. Provo përsëri, dhe nëse problemi vazhdon, na kontakto.</p>
          {digest && <p className="mt-3 text-xs text-faint">Kodi i gabimit: {digest}</p>}
        </>
      }
      actions={
        <>
          <SlashActionButton onClick={retry}>PROVO PËRSËRI</SlashActionButton>
          <GhostButton href="/">FAQJA KRYESORE</GhostButton>
        </>
      }
    />
  );
}
