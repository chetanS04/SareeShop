"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNotifications, AppNotification } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Sparkles,
  Truck,
  RefreshCw,
  ShieldAlert,
  Mail,
  Info,
  X,
  ExternalLink,
} from "lucide-react";

export default function GlobalNotificationToast() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { activeToast, clearActiveToast } = useNotifications();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        clearActiveToast();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast, clearActiveToast]);

  if (!mounted || !activeToast || typeof document === "undefined") {
    return null;
  }

  const isAdminView =
    pathname?.startsWith("/dashboard") ||
    ["Admin", "Manager", "superadmin"].includes(user?.role || "");

  const getNotificationIcon = (type: string) => {
    const t = (type || "").toUpperCase();
    const cls = "w-5 h-5 text-primary";
    if (t.startsWith("ORDER")) return <ShoppingBag className={cls} strokeWidth={1.5} />;
    if (t.startsWith("PAYMENT"))
      return <Sparkles className="w-5 h-5 text-accent-ochre" strokeWidth={1.5} />;
    if (t.startsWith("SHIPMENT") || t.startsWith("DELIVERY"))
      return <Truck className="w-5 h-5 text-on-surface" strokeWidth={1.5} />;
    if (t.startsWith("RETURN") || t.startsWith("REFUND"))
      return <RefreshCw className={cls} strokeWidth={1.5} />;
    if (t.startsWith("SECURITY") || t.startsWith("PASSWORD") || t === "ACCOUNT")
      return <ShieldAlert className={cls} strokeWidth={1.5} />;
    if (t === "CONTACT") return <Mail className="w-5 h-5 text-on-surface" strokeWidth={1.5} />;
    return <Info className="w-5 h-5 text-body-slate" strokeWidth={1.5} />;
  };

  const getItemLink = (n: AppNotification) => {
    if (!isAdminView) {
      const type = (n.type || "").toUpperCase();
      if (
        type.startsWith("ORDER") ||
        !n.link ||
        n.link === "/orders" ||
        n.link.startsWith("/orders")
      ) {
        return "/profile?tab=orders";
      }
    }
    return n.link || (isAdminView ? "/dashboard/orders" : "/profile?tab=orders");
  };

  const targetLink = getItemLink(activeToast);

  return createPortal(
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-5 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-[99999999] max-w-sm w-[calc(100vw-2rem)] sm:w-96 bg-surface border border-border-line border-l-2 border-l-primary p-4 sm:p-5 flex gap-3.5 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto select-none"
    >
      <div className="w-10 h-10 bg-surface-ivory border border-border-line flex items-center justify-center shrink-0 mt-0.5">
        {getNotificationIcon(activeToast.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-[12px] sm:text-[13px] font-bold uppercase tracking-tight text-on-surface leading-tight">
            {activeToast.title || "Notification"}
          </h4>
          <button
            type="button"
            onClick={clearActiveToast}
            className="text-body-slate hover:text-primary p-1 -mr-1 -mt-1 transition-colors"
            title="Close"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[12px] text-body-slate line-clamp-3 leading-relaxed mb-2.5">
          {activeToast.message}
        </p>

        {targetLink && (
          <Link
            href={targetLink}
            onClick={clearActiveToast}
            className="inline-flex items-center gap-1.5 label-caps text-[10px] text-primary hover:text-on-surface underline underline-offset-2 decoration-border-line hover:decoration-primary transition-colors"
          >
            View Now <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>,
    document.body
  );
}
