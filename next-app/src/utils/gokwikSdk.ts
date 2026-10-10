/**
 * GoKwik checkout SDK loader.
 * Official script is `/v4/build/gokwik.js` — the legacy `/build/gokwik.js`
 * does not expose `initCheckout`, which caused the "did not load in time" error.
 *
 * IMPORTANT: Never put functions in the initCheckout payload. GoKwik postMessages
 * that object into an iframe; functions cannot be structured-cloned (DataCloneError).
 * Use `gokwikSdk.on(...)` for success / close / failure instead.
 */

export const GOKWIK_SCRIPT_ID = "gokwik-sdk";

export function gokwikScriptUrl(env?: string): string {
  const mode = (env || process.env.NEXT_PUBLIC_GOKWIK_ENV || "production").toLowerCase();
  if (mode === "sandbox" || mode === "dev" || mode === "qa") {
    return "https://sandbox.pdp.gokwik.co/v4/build/gokwik.js";
  }
  return "https://pdp.gokwik.co/v4/build/gokwik.js";
}

export function getGokwikSdk(): any | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  const sdk = w.gokwikSdk || w.gokwik || w.Gokwik || w.gokwikCheckout;
  if (sdk && typeof sdk.initCheckout === "function") return sdk;
  return null;
}

/** Inject / wait for GoKwik SDK (up to `timeoutMs`). */
export function waitForGokwikSdk(timeoutMs = 20000): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("GoKwik is only available in the browser."));
      return;
    }

    const existing = getGokwikSdk();
    if (existing) {
      resolve(existing);
      return;
    }

    ensureGokwikScript();

    const deadline = Date.now() + timeoutMs;
    const tick = () => {
      const sdk = getGokwikSdk();
      if (sdk) {
        resolve(sdk);
        return;
      }
      if (Date.now() > deadline) {
        reject(
          new Error(
            "Payment gateway could not load. Please refresh the page, disable ad blockers, and try again — or choose Cash on Delivery."
          )
        );
        return;
      }
      setTimeout(tick, 250);
    };
    tick();
  });
}

function ensureGokwikScript() {
  if (typeof document === "undefined") return;
  const src = gokwikScriptUrl();
  const existing = document.getElementById(GOKWIK_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    if (existing.src && !existing.src.includes("/v4/")) {
      existing.remove();
    } else {
      return;
    }
  }
  const script = document.createElement("script");
  script.id = GOKWIK_SCRIPT_ID;
  script.src = src;
  script.async = true;
  document.body.appendChild(script);
}

export type GokwikInitArgs = {
  merchantId: string;
  environment: string;
  orderNumber: string;
  amount: number;
  customer?: Record<string, unknown>;
  cart?: Record<string, unknown>;
  shippingAddress?: Record<string, unknown>;
  returnUrl: string;
  onSuccess: (data?: any) => void;
  onError: (err?: any) => void;
  onClose: () => void;
};

function bindGokwikEvents(
  sdk: any,
  handlers: Pick<GokwikInitArgs, "onSuccess" | "onError" | "onClose">
) {
  if (typeof sdk.on !== "function") return;

  let settled = false;
  const onceSuccess = (order: any) => {
    if (settled) return;
    settled = true;
    handlers.onSuccess(order);
  };
  const onceError = (err: any) => {
    if (settled) return;
    settled = true;
    handlers.onError(err);
  };
  const onceClose = () => {
    if (settled) return;
    settled = true;
    handlers.onClose();
  };

  try {
    sdk.on("order-complete", onceSuccess);
    sdk.on("payment-success", onceSuccess);
    sdk.on("checkout-close", onceClose);
    sdk.on("checkout-initiation-failure", onceError);
    sdk.on("payment-failure", onceError);
  } catch (e) {
    console.warn("GoKwik event bind failed", e);
  }
}

/**
 * Open GoKwik checkout with a serializable-only payload (no function callbacks).
 */
export async function openGokwikCheckout(args: GokwikInitArgs): Promise<void> {
  const sdk = await waitForGokwikSdk();

  bindGokwikEvents(sdk, {
    onSuccess: args.onSuccess,
    onError: args.onError,
    onClose: args.onClose,
  });

  // Official Woo / v4 shape — must be JSON-cloneable for iframe postMessage
  const merchantInfoPayload = {
    environment: args.environment,
    type: "merchantInfo",
    mid: args.merchantId,
    merchantParams: {
      merchantCheckoutId: args.orderNumber,
    },
  };

  try {
    sdk.initCheckout(merchantInfoPayload);
    return;
  } catch (e) {
    console.warn("GoKwik merchantInfo init failed, trying order payload", e);
  }

  // Fallback: still no functions — only plain data
  sdk.initCheckout({
    merchantId: args.merchantId,
    mid: args.merchantId,
    environment: args.environment,
    orderId: args.orderNumber,
    order_id: args.orderNumber,
    amount: args.amount,
    currency: "INR",
    customer: args.customer || {},
    cart: args.cart || {},
    shipping_address: args.shippingAddress,
    return_url: args.returnUrl,
  });
}
