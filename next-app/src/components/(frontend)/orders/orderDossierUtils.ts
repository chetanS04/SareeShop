import { parseAddress } from "../../../../utils/addressUtils";

export const formatINR = (val: number | string | undefined | null) =>
  `₹${Math.round(Number(val) || 0).toLocaleString("en-IN")}`;

export function formatOrderDate(dateString?: string | null) {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function estimateArrival(dateString?: string | null) {
  if (!dateString) return "3–5 business days";
  try {
    const start = new Date(dateString);
    if (isNaN(start.getTime())) return "3–5 business days";
    const a = new Date(start);
    a.setDate(a.getDate() + 4);
    const b = new Date(start);
    b.setDate(b.getDate() + 6);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return `${fmt(a)} – ${fmt(b)}`;
  } catch {
    return "3–5 business days";
  }
}

export function paymentLabel(method?: string | null, status?: string | null) {
  const m = (method || "").toLowerCase();
  const isCod = m === "cash_on_delivery" || m === "cod";
  const base = isCod ? "COD" : "Online";
  const paid = (status || "").toLowerCase() === "paid";
  return { base, paid, isCod };
}

/** Atelier lifecycle: 4 stages matching confirmation mock */
export function getLifecycle(status?: string | null) {
  const s = (status || "").toLowerCase();
  const stages = ["Authenticated", "Atelier Review", "Bespoke Packing", "Dispatch"] as const;

  let index = 0; // 0-based active stage
  if (["cancelled"].includes(s)) {
    return { stages, index: 0, label: "Cancelled", progress: 0.1, cancelled: true };
  }
  if (["pending"].includes(s)) {
    index = 0;
  } else if (["confirmed"].includes(s)) {
    index = 1;
  } else if (["processing"].includes(s)) {
    index = 2;
  } else if (["shipped", "out_for_delivery"].includes(s)) {
    index = 3;
  } else if (["delivered", "completed"].includes(s)) {
    index = 3;
  }

  const done = ["delivered", "completed"].includes(s);
  const progress = done ? 1 : Math.min(0.95, (index + 1) / 4 + 0.05);

  return {
    stages,
    index,
    label: `Stage ${String(index + 1).padStart(2, "0")} of 04 · ${stages[index]}`,
    progress,
    cancelled: false,
    done,
  };
}

export function getOrderItems(order: any): any[] {
  return order?.order_items || order?.orderItems || [];
}

export function getOrderNumber(order: any): string {
  return String(order?.order_number || order?.orderNumber || order?.id || "—");
}

export function getShippingParts(order: any) {
  const raw = order?.shipping_address || order?.shippingAddress;
  const parsed = parseAddress(raw);
  if (parsed) {
    return {
      name: parsed.name || "—",
      phone: parsed.phone || "",
      lines: [
        parsed.add,
        [parsed.city, parsed.state].filter(Boolean).join(", "),
        parsed.pin ? `${parsed.pin}` : "",
        parsed.country,
      ].filter(Boolean),
      raw: null as string | null,
    };
  }
  const text = raw ? String(raw) : "";
  return {
    name: "Shipping destination",
    phone: "",
    lines: text ? text.split(/\n+/).filter(Boolean) : ["Address on file"],
    raw: text || null,
  };
}

export function statusChip(status?: string | null) {
  const s = (status || "").toLowerCase();
  if (["delivered", "completed"].includes(s)) {
    return { label: "Delivered", className: "text-primary" };
  }
  if (["shipped", "out_for_delivery"].includes(s)) {
    return {
      label: s === "out_for_delivery" ? "Out for Delivery" : "Shipped",
      className: "text-primary",
    };
  }
  if (["confirmed", "processing"].includes(s)) {
    return {
      label: s === "confirmed" ? "Confirmed" : "Processing",
      className: "text-primary",
    };
  }
  if (s === "pending") return { label: "Pending", className: "text-accent-ochre" };
  if (s === "cancelled") return { label: "Cancelled", className: "text-primary" };
  return {
    label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Placed",
    className: "text-body-slate",
  };
}
