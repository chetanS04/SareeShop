"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Mail,
  Info,
  ShieldAlert,
  Sparkles,
  Truck,
  RotateCcw,
  SlidersHorizontal,
  Check,
  ArrowLeft,
  X,
  Lock,
} from "lucide-react";
import { useNotifications, NotificationPreference } from "@/context/NotificationContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    preferences,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkDeleteNotifications,
    updatePreferences,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false);
  const [prefState, setPrefState] = useState<Partial<NotificationPreference>>({});

  // Sync preference state when preferences load
  useEffect(() => {
    if (preferences) {
      setPrefState(preferences);
    }
  }, [preferences]);

  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Initial fetch and tab change handler
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    const isUnreadTab = activeTab === "UNREAD";
    const category = isUnreadTab || activeTab === "ALL" ? undefined : activeTab;
    const isRead = isUnreadTab ? false : undefined;

    fetchNotifications({
      category,
      is_read: isRead,
      page: 1,
      limit: 8,
      append: false,
    }).then((moreAvailable) => {
      setHasMore(moreAvailable);
    });
  }, [activeTab, fetchNotifications]);

  // Load next batch on scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const isUnreadTab = activeTab === "UNREAD";
    const category = isUnreadTab || activeTab === "ALL" ? undefined : activeTab;
    const isRead = isUnreadTab ? false : undefined;

    const moreAvailable = await fetchNotifications({
      category,
      is_read: isRead,
      page: nextPage,
      limit: 8,
      append: true,
    });

    setPage(nextPage);
    setHasMore(moreAvailable);
    setLoadingMore(false);
  }, [loadingMore, hasMore, page, activeTab, fetchNotifications]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  // Handle select all checkbox
  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length && notifications.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  // Toggle single selection
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    await bulkDeleteNotifications({ ids: selectedIds });
    setSelectedIds([]);
  };

  const handleBulkDeleteRead = async () => {
    await bulkDeleteNotifications({ allRead: true });
    setSelectedIds([]);
  };

  const handleSavePreferences = async () => {
    await updatePreferences(prefState);
    setShowPreferencesModal(false);
  };

  const getNotificationIcon = (type: string) => {
    const t = (type || "").toUpperCase();
    if (t.startsWith("ORDER")) return <ShoppingBag className="w-5 h-5 text-primary" />;
    if (t.startsWith("PAYMENT")) return <Sparkles className="w-5 h-5 text-accent-ochre" />;
    if (t.startsWith("SHIPMENT") || t.startsWith("DELIVERY")) return <Truck className="w-5 h-5 text-on-surface" />;
    if (t.startsWith("RETURN") || t.startsWith("REFUND")) return <RotateCcw className="w-5 h-5 text-primary" />;
    if (t.startsWith("SECURITY") || t.startsWith("PASSWORD") || t === "ACCOUNT" || t === "WELCOME") return <ShieldAlert className="w-5 h-5 text-primary" />;
    if (t === "CONTACT") return <Mail className="w-5 h-5 text-on-surface" />;
    return <Info className="w-5 h-5 text-body-slate" />;
  };

  const getPriorityBadge = (priority?: string) => {
    const p = (priority || "NORMAL").toUpperCase();
    switch (p) {
      case "CRITICAL":
        return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-primary text-surface">CRITICAL</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-accent-ochre text-surface-dark">HIGH</span>;
      case "LOW":
        return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-surface-ivory text-body-slate border border-border-line">LOW</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-surface-dark text-surface">UPDATE</span>;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const raw = String(dateStr).trim();
      const cleanStr = raw.replace("Z", "").replace("T", " ");
      const parts = cleanStr.split(".")[0].split(/[- :]/);

      let d: Date;
      if (parts.length >= 6) {
        const year = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const day = Number(parts[2]);
        const hour = Number(parts[3]);
        const minute = Number(parts[4]);
        const second = Number(parts[5]);
        d = new Date(year, month, day, hour, minute, second || 0);
      } else {
        d = new Date(raw);
      }

      if (isNaN(d.getTime())) return dateStr;

      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const categories = [
    { id: "ALL", label: "All" },
    { id: "UNREAD", label: `Unread (${unreadCount})` },
    { id: "ORDERS", label: "Orders" },
    { id: "PAYMENTS", label: "Payments" },
    { id: "SHIPPING", label: "Shipping" },
    { id: "RETURNS", label: "Returns & Refunds" },
    { id: "PRODUCTS", label: "Products" },
    { id: "ACCOUNT", label: "Account" },
    { id: "MARKETING", label: "Offers" },
  ];

  return (
    <div className="min-h-screen bg-surface py-8 sm:py-12 text-on-surface">
      <div className="max-w-site mx-auto site-pad space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-pure-white p-6 sm:p-8 border border-border-line shadow-none">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 border border-border-line text-on-surface hover:text-primary hover:border-primary transition-colors flex items-center justify-center"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="label-caps text-primary block mb-1">Concierge Desk</span>
              <div className="flex items-center gap-3">
                <h1 className="display-section text-2xl sm:text-3xl text-on-surface">
                  Notification Center
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 text-[11px] font-bold bg-primary text-surface uppercase tracking-wider">
                    {unreadCount > 99 ? "99+" : unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-body-slate mt-1 leading-relaxed">
                Manage your real-time alerts, order status updates, and notification preferences.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreferencesModal(true)}
              className="sv-btn-outline py-2.5 px-4 text-xs font-semibold label-caps inline-flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4 text-on-surface" />
              <span>Preferences</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="sv-btn-primary py-2.5 px-4 text-xs font-semibold label-caps inline-flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                setSelectedIds([]);
              }}
              className={`px-4 py-2.5 text-xs font-bold label-caps whitespace-nowrap transition-all border ${
                activeTab === cat.id
                  ? "bg-surface-dark text-surface border-surface-dark"
                  : "bg-pure-white text-body-slate border-border-line hover:text-on-surface hover:border-on-surface"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Bulk Action Controls Bar */}
        {notifications.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-pure-white border border-border-line text-xs text-on-surface shadow-none">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer font-bold select-none label-caps text-xs text-on-surface">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === notifications.length}
                  onChange={toggleSelectAll}
                  className="rounded-none text-primary focus:ring-primary w-4 h-4 cursor-pointer accent-primary"
                />
                <span>Select All</span>
              </label>
              {selectedIds.length > 0 && (
                <span className="label-caps font-bold text-primary bg-surface-ivory px-2.5 py-0.5 border border-border-line text-[10px]">
                  {selectedIds.length} Selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDeleteSelected}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold label-caps text-primary hover:bg-surface-ivory border border-primary transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}

              <button
                onClick={handleBulkDeleteRead}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold label-caps text-body-slate hover:text-on-surface hover:bg-surface-ivory border border-border-line transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Read</span>
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 text-center bg-pure-white border border-border-line">
              <div className="w-8 h-8 border-2 border-border-line border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
              <p className="label-caps text-xs text-body-slate">Curating notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center bg-pure-white border border-border-line px-4 shadow-none">
              <Bell className="w-12 h-12 mx-auto text-body-slate/40 mb-3 stroke-[1.25]" />
              <span className="label-caps text-primary block mb-1">Clean Inbox</span>
              <h3 className="display-section text-lg sm:text-xl text-on-surface mb-1">
                No Notifications Found
              </h3>
              <p className="text-xs sm:text-sm text-body-slate max-w-sm mx-auto leading-relaxed">
                You don&apos;t have any notifications under this category right now.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isSelected = selectedIds.includes(n.id);
              return (
                <div
                  key={n.id}
                  className={`p-5 sm:p-6 border transition-all flex items-start gap-4 ${
                    !n.isRead
                      ? "bg-pure-white border-border-line border-l-4 border-l-primary shadow-none"
                      : "bg-pure-white/90 border-border-line"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(n.id)}
                    className="mt-1.5 rounded-none text-primary focus:ring-primary w-4 h-4 cursor-pointer accent-primary"
                  />

                  <div className="w-10 h-10 bg-surface-ivory border border-border-line flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                      {getPriorityBadge(n.priority)}
                      <h3 className="text-sm font-bold text-on-surface uppercase tracking-tight truncate">
                        {n.title}
                      </h3>
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-primary"></span>
                      )}
                      <span className="label-caps text-[11px] text-body-slate ml-auto font-semibold">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-body-slate leading-relaxed mb-3.5">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-4 flex-wrap">
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n.id);
                          }}
                          className="sv-btn-primary py-2 px-3.5 text-xs font-semibold label-caps inline-flex items-center gap-1.5"
                        >
                          <span>View Details</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="sv-btn-outline py-2 px-3 text-xs font-semibold label-caps inline-flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark read</span>
                        </button>
                      )}

                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="ml-auto p-1.5 text-body-slate/60 hover:text-primary transition-colors"
                        title="Delete notification"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Infinite Scroll Indicators */}
        {loadingMore && (
          <div className="py-4 text-center text-xs font-bold label-caps text-body-slate bg-pure-white border border-border-line">
            Curating more notifications...
          </div>
        )}
        {!hasMore && notifications.length > 0 && (
          <div className="py-4 text-center label-caps text-xs text-body-slate/70">
            You&apos;ve reached the end of notifications
          </div>
        )}
      </div>

      {/* Customer Notification Preferences Modal */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-surface-dark/70 backdrop-blur-xs animate-fade-in-up">
          <div className="bg-pure-white border border-border-line max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-surface-ivory border border-border-line flex items-center justify-center text-primary">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <span className="label-caps text-primary block text-[10px]">Atelier Settings</span>
                  <h3 className="display-section text-lg sm:text-xl text-on-surface">
                    Notification Preferences
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setShowPreferencesModal(false)}
                className="p-2 text-on-surface hover:text-primary transition-colors"
                title="Close"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle Settings Grid */}
            <div className="space-y-3.5">
              {[
                { keyInApp: "inAppOrders", keyEmail: "emailOrders", label: "Order & Dispatch Updates", desc: "Order confirmation, shipping, tracking & delivery alerts" },
                { keyInApp: "inAppPayments", keyEmail: "emailPayments", label: "Payment & Invoice Updates", desc: "Payment status, receipts, and failure notices" },
                { keyInApp: "inAppShipping", keyEmail: "emailShipping", label: "Shipping & Courier Tracking", desc: "Out for delivery and delivery exception alerts" },
                { keyInApp: "inAppReturns", keyEmail: "emailReturns", label: "Returns & Refund Status", desc: "Return approvals, pickup schedules, and refund completions" },
                { keyInApp: "inAppProducts", keyEmail: "emailProducts", label: "Product & Price Drop Alerts", desc: "Wishlist price drop and back-in-stock alerts" },
                { keyInApp: "inAppMarketing", keyEmail: "emailMarketing", label: "Marketing & Exclusive Offers", desc: "Flash sales, coupon codes, and promotional offers" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-4 bg-surface-subtle/70 border border-border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="label-caps text-xs font-bold text-on-surface">{item.label}</h4>
                    <p className="text-[11px] text-body-slate mt-0.5 leading-snug">{item.desc}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <label className="flex items-center gap-1.5 label-caps text-[11px] font-bold text-on-surface cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(prefState[item.keyInApp as keyof NotificationPreference])}
                        onChange={(e) =>
                          setPrefState((prev) => ({ ...prev, [item.keyInApp]: e.target.checked }))
                        }
                        className="rounded-none text-primary focus:ring-primary w-4 h-4 cursor-pointer accent-primary"
                      />
                      <span>In-App</span>
                    </label>

                    <label className="flex items-center gap-1.5 label-caps text-[11px] font-bold text-on-surface cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(prefState[item.keyEmail as keyof NotificationPreference])}
                        onChange={(e) =>
                          setPrefState((prev) => ({ ...prev, [item.keyEmail]: e.target.checked }))
                        }
                        className="rounded-none text-primary focus:ring-primary w-4 h-4 cursor-pointer accent-primary"
                      />
                      <span>Email</span>
                    </label>
                  </div>
                </div>
              ))}

              <div className="p-3.5 bg-surface-ivory border border-border-line flex items-center gap-3 text-xs font-medium text-on-surface">
                <Lock className="w-4 h-4 shrink-0 text-accent-ochre" />
                <span className="text-xs text-body-slate leading-relaxed">
                  <strong className="text-on-surface">Security Note:</strong> Critical security alerts (password resets, login verifications) are mandatory and cannot be disabled.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border-line pt-4">
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="sv-btn-outline py-2.5 px-5 text-xs font-semibold label-caps"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="sv-btn-primary py-2.5 px-6 text-xs font-semibold label-caps"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
