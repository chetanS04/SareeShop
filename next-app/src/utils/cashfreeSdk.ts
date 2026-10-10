/**
 * Cashfree Checkout JS SDK (v3)
 * https://sdk.cashfree.com/js/v3/cashfree.js
 */

export const CASHFREE_SCRIPT_ID = "cashfree-sdk";
export const CASHFREE_SCRIPT_SRC = "https://sdk.cashfree.com/js/v3/cashfree.js";

export function cashfreeMode(env?: string): "sandbox" | "production" {
  const mode = (env || process.env.NEXT_PUBLIC_CASHFREE_MODE || "sandbox").toLowerCase();
  return mode === "production" ? "production" : "sandbox";
}

function getCashfreeFactory(): any | null {
  if (typeof window === "undefined") return null;
  return (window as any).Cashfree || null;
}

export function ensureCashfreeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Cashfree is only available in the browser."));
      return;
    }
    if (getCashfreeFactory()) {
      resolve();
      return;
    }
    const existing = document.getElementById(CASHFREE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Cashfree SDK failed to load. Please refresh and try again."))
      );
      // Already loading / loaded
      if (getCashfreeFactory()) resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = CASHFREE_SCRIPT_ID;
    script.src = CASHFREE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Cashfree SDK failed to load. Please refresh and try again."));
    document.body.appendChild(script);
  });
}

export async function openCashfreeCheckout(args: {
  paymentSessionId: string;
  mode?: string;
}): Promise<void> {
  await ensureCashfreeScript();
  const Cashfree = getCashfreeFactory();
  if (!Cashfree) {
    throw new Error("Cashfree SDK is not available. Please refresh the page.");
  }
  const cashfree = Cashfree({ mode: cashfreeMode(args.mode) });
  const result = await cashfree.checkout({
    paymentSessionId: args.paymentSessionId,
    redirectTarget: "_self",
  });
  if (result?.error) {
    throw new Error(result.error.message || "Payment was not completed.");
  }
}
