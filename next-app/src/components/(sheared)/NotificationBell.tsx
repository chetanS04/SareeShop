"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Mail,
  Info,
  ShieldAlert,
  Sparkles,
  Truck,
  RefreshCw,
  Layers,
} from "lucide-react";
import { useNotifications, AppNotification } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function NotificationBell() {
  const pathname = usePathname();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const isAdminView =
    pathname?.startsWith("/dashboard") ||
    ["Admin", "Manager", "superadmin"].includes(user?.role || "");
  const viewAllUrl = isAdminView ? "/dashboard/notifications" : "/notifications";

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadInState = notifications.filter((n) => !n.isRead).length;
  const effectiveUnreadCount =
    notifications.length > 0 && notifications.length <= unreadCount
      ? unreadInState
      : unreadCount;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.isRead : true
  );

  const getNotificationIcon = (type: string) => {
    const t = (type || "").toUpperCase();
    const cls = "w-4 h-4 text-primary";
    if (t.startsWith("ORDER")) return <ShoppingBag className={cls} strokeWidth={1.5} />;
    if (t.startsWith("PAYMENT")) return <Sparkles className="w-4 h-4 text-accent-ochre" strokeWidth={1.5} />;
    if (t.startsWith("SHIPMENT") || t.startsWith("DELIVERY"))
      return <Truck className="w-4 h-4 text-on-surface" strokeWidth={1.5} />;
    if (t.startsWith("RETURN") || t.startsWith("REFUND"))
      return <RefreshCw className={cls} strokeWidth={1.5} />;
    if (t.startsWith("SECURITY") || t.startsWith("PASSWORD") || t === "ACCOUNT")
      return <ShieldAlert className={cls} strokeWidth={1.5} />;
    if (t === "CONTACT") return <Mail className="w-4 h-4 text-on-surface" strokeWidth={1.5} />;
    return <Info className="w-4 h-4 text-body-slate" strokeWidth={1.5} />;
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    try {
      const raw = String(dateStr).trim();
      const cleanStr = raw.replace("Z", "").replace("T", " ");
      const parts = cleanStr.split(".")[0].split(/[- :]/);

      let d: Date;
      if (parts.length >= 6) {
        d = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2]),
          Number(parts[3]),
          Number(parts[4]),
          Number(parts[5]) || 0
        );
      } else {
        d = new Date(raw);
      }

      if (isNaN(d.getTime())) return "Just now";

      const now = new Date();
      let diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
      if (diffSec < 0) diffSec = Math.abs(diffSec);

      if (diffSec < 45) return "Just now";
      if (diffSec < 3600) return `${Math.max(1, Math.floor(diffSec / 60))}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;

      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Just now";
    }
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

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 sm:p-2 text-on-surface hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell
          className={`w-5 h-5 ${effectiveUnreadCount > 0 ? "text-primary" : "text-on-surface"}`}
          strokeWidth={1.5}
        />
        {effectiveUnreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[15px] h-[15px] px-1 text-[9px] font-bold text-surface bg-primary border border-surface pointer-events-none">
            {effectiveUnreadCount > 99 ? "99+" : effectiveUnreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute -right-16 sm:right-0 mt-3 w-[310px] sm:w-80 md:w-96 max-w-[calc(100vw-20px)] bg-surface border border-border-line z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border-line bg-surface-ivory">
            <div className="flex items-center gap-2.5 min-w-0">
              <h3 className="text-[13px] font-bold uppercase tracking-tight text-on-surface">
                Notifications
              </h3>
              {effectiveUnreadCount > 0 && (
                <span className="label-caps text-[9px] px-2 py-0.5 bg-primary text-surface shrink-0">
                  {effectiveUnreadCount > 99 ? "99+" : effectiveUnreadCount} unread
                </span>
              )}
            </div>

            {effectiveUnreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 label-caps text-[10px] text-primary hover:text-on-surface transition-colors shrink-0"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-border-line px-4 py-2.5 gap-2 bg-surface">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 label-caps text-[10px] transition-colors border ${
                filter === "all"
                  ? "bg-surface-dark text-surface border-surface-dark"
                  : "bg-surface text-body-slate border-border-line hover:border-on-surface hover:text-on-surface"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 label-caps text-[10px] transition-colors border ${
                filter === "unread"
                  ? "bg-surface-dark text-surface border-surface-dark"
                  : "bg-surface text-body-slate border-border-line hover:border-on-surface hover:text-on-surface"
              }`}
            >
              Unread ({effectiveUnreadCount})
            </button>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border-line bg-surface">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center px-4">
                <Bell className="w-9 h-9 mx-auto text-body-slate/35 mb-2" strokeWidth={1.25} />
                <p className="label-caps text-[10px] text-body-slate">
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </p>
              </div>
            ) : (
              filteredNotifications.slice(0, 10).map((n) => {
                const targetLink = getItemLink(n);
                return (
                  <div
                    key={n.id}
                    className={`p-3.5 flex gap-3 transition-colors ${
                      !n.isRead
                        ? "bg-surface-ivory border-l-2 border-l-primary"
                        : "hover:bg-surface-subtle/80"
                    }`}
                  >
                    <div className="w-9 h-9 bg-surface border border-border-line flex items-center justify-center shrink-0">
                      {getNotificationIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h4 className="text-[12px] font-bold uppercase tracking-tight text-on-surface truncate">
                          {n.title}
                        </h4>
                        <span className="label-caps text-[9px] text-body-slate shrink-0">
                          {formatTime(n.createdAt)}
                        </span>
                      </div>

                      <p className="text-[12px] text-body-slate line-clamp-2 leading-snug mb-2">
                        {n.message}
                      </p>

                      <div className="flex items-center gap-3 flex-wrap">
                        {targetLink && (
                          <Link
                            href={targetLink}
                            onClick={() => {
                              if (!n.isRead) markAsRead(n.id);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1 label-caps text-[10px] text-primary hover:text-on-surface underline underline-offset-2 decoration-border-line hover:decoration-primary"
                          >
                            View Details <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}

                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={() => markAsRead(n.id)}
                            className="label-caps text-[10px] text-body-slate hover:text-on-surface inline-flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Mark read
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteNotification(n.id)}
                          className="ml-auto text-body-slate/50 hover:text-primary transition-colors p-1"
                          title="Delete"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border-line bg-surface-ivory text-center">
            <Link
              href={viewAllUrl}
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 label-caps text-[10px] text-primary hover:text-on-surface w-full py-1 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
