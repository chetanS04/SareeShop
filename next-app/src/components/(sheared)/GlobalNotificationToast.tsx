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

  // Auto-dismiss active toast after 6 seconds
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
    if (t.startsWith("ORDER")) return <ShoppingBag className="w-5 h-5 text-[#007FFF]" />;
    if (t.startsWith("PAYMENT")) return <Sparkles className="w-5 h-5 text-emerald-600" />;
    if (t.startsWith("SHIPMENT") || t.startsWith("DELIVERY")) return <Truck className="w-5 h-5 text-indigo-600" />;
    if (t.startsWith("RETURN") || t.startsWith("REFUND")) return <RefreshCw className="w-5 h-5 text-amber-600" />;
    if (t.startsWith("SECURITY") || t.startsWith("PASSWORD") || t === "ACCOUNT") return <ShieldAlert className="w-5 h-5 text-red-600" />;
    if (t === "CONTACT") return <Mail className="w-5 h-5 text-purple-600" />;
    return <Info className="w-5 h-5 text-gray-600" />;
  };

  const getItemLink = (n: AppNotification) => {
    if (!isAdminView) {
      const type = (n.type || "").toUpperCase();
      if (type.startsWith("ORDER") || !n.link || n.link === "/orders" || n.link.startsWith("/orders")) {
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
      className="fixed top-5 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-[99999999] max-w-sm w-[calc(100vw-2rem)] sm:w-96 bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl shadow-2xl p-4 sm:p-4.5 flex gap-3.5 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto select-none"
    >
      <div className="p-2.5 rounded-xl bg-blue-50/90 border border-blue-100/80 h-fit shrink-0 mt-0.5">
        {getNotificationIcon(activeToast.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-xs sm:text-[13px] font-bold text-gray-900 leading-tight">
            {activeToast.title || "Notification"}
          </h4>
          <button
            type="button"
            onClick={clearActiveToast}
            className="text-gray-400 hover:text-gray-700 p-1 -mr-1 -mt-1 rounded-lg hover:bg-gray-100 transition-colors"
            title="Close"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-2.5">
          {activeToast.message}
        </p>

        {targetLink && (
          <Link
            href={targetLink}
            onClick={clearActiveToast}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007FFF] hover:text-[#0066CC] hover:underline transition-colors"
          >
            View Now <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>,
    document.body
  );
}
