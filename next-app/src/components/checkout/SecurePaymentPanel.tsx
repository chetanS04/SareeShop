"use client";

import React, { useState } from "react";
import {
  BadgeCheck,
  Building2,
  ChevronDown,
  CreditCard,
  Info,
  Lock,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export type PaymentMethodValue = "cod" | "online";
export type PaymentChannel = "upi" | "card" | "netbanking" | "cod";

type SecurePaymentPanelProps = {
  paymentMethod: PaymentMethodValue;
  onChange: (method: PaymentMethodValue, channel?: PaymentChannel) => void;
  isCodDisabled?: boolean;
  codDisabledReason?: React.ReactNode;
  finalTotal: number;
};

const channelToMethod = (ch: PaymentChannel): PaymentMethodValue =>
  ch === "cod" ? "cod" : "online";

export default function SecurePaymentPanel({
  paymentMethod,
  onChange,
  isCodDisabled = false,
  codDisabledReason,
  finalTotal,
}: SecurePaymentPanelProps) {
  const [channel, setChannel] = useState<PaymentChannel>(
    paymentMethod === "cod" ? "cod" : "upi"
  );

  const select = (next: PaymentChannel) => {
    if (next === "cod" && isCodDisabled) return;
    setChannel(next);
    onChange(channelToMethod(next), next);
  };

  const methods: {
    id: PaymentChannel;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    badge?: string;
    disabled?: boolean;
  }[] = [
    {
      id: "upi",
      title: "UPI Instant Transfer",
      subtitle: "Google Pay, PhonePe, Paytm, BHIM, or any UPI app",
      icon: <Smartphone className="w-5 h-5" />,
    },
    {
      id: "card",
      title: "Credit / Debit Card",
      subtitle: "Visa, Mastercard, American Express, RuPay",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: "netbanking",
      title: "Net Banking",
      subtitle: "All major Indian retail & private banks",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      id: "cod",
      title: "Cash on Delivery",
      subtitle: isCodDisabled
        ? "Unavailable for one or more items in your bag"
        : "Pay with cash or UPI when your piece arrives",
      icon: <BadgeCheck className="w-5 h-5" />,
      badge: isCodDisabled ? "Unavailable" : "Doorstep",
      disabled: isCodDisabled,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
          <span className="label-caps text-[10px] tracking-widest font-semibold">
            Authentic & Protected
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-on-surface">
          Secure Payment
        </h2>
        <p className="text-[14px] sm:text-[15px] text-body-slate max-w-2xl leading-relaxed">
          Select your preferred method. Online options open a secure gateway on
          the next step — encrypted end-to-end.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {methods.map((m) => {
          const open = channel === m.id;
          return (
            <div
              key={m.id}
              className={`border transition-colors ${
                open
                  ? "border-on-surface bg-surface-ivory"
                  : "border-border-line bg-surface-subtle"
              } ${m.disabled ? "opacity-60" : ""}`}
            >
              <button
                type="button"
                disabled={m.disabled}
                onClick={() => select(m.id)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      open ? "border-primary" : "border-body-slate/40"
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        open ? "bg-primary" : "bg-transparent"
                      }`}
                    />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-semibold uppercase tracking-tight text-on-surface">
                        {m.title}
                      </h3>
                      {m.badge && (
                        <span className="label-caps text-[9px] px-2 py-0.5 bg-surface text-on-surface border border-border-line">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-body-slate mt-0.5">{m.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-body-slate shrink-0">
                  <span className={open ? "text-primary" : ""}>{m.icon}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {open && (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-border-line/60">
                  {m.id === "upi" && (
                    <div className="pt-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {["GPay", "PhonePe", "Paytm", "UPI"].map((label) => (
                          <span
                            key={label}
                            className="label-caps text-[10px] px-2.5 py-1 bg-surface border border-border-line text-on-surface"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                      <p className="text-[12px] text-body-slate flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        You will confirm UPI on the secure payment screen. Zero surcharge.
                      </p>
                    </div>
                  )}

                  {m.id === "card" && (
                    <div className="pt-4 space-y-3">
                      <p className="text-[12px] text-body-slate flex items-start gap-2">
                        <Lock className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        Card details are entered only on the PCI-DSS certified gateway — never on
                        this page.
                      </p>
                    </div>
                  )}

                  {m.id === "netbanking" && (
                    <div className="pt-4 space-y-3">
                      <p className="label-caps text-[10px] text-on-surface">Popular banks</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["HDFC", "ICICI", "SBI", "Axis"].map((b) => (
                          <span
                            key={b}
                            className="text-[12px] font-semibold text-on-surface px-3 py-2.5 bg-surface border border-border-line text-center"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                      <p className="text-[12px] text-body-slate">
                        Choose your bank on the next secure screen.
                      </p>
                    </div>
                  )}

                  {m.id === "cod" && (
                    <div className="pt-4 space-y-3">
                      {isCodDisabled ? (
                        <div className="p-3 bg-surface border border-primary text-[12px] text-primary">
                          {codDisabledReason ||
                            "Cash on Delivery is unavailable for items in your bag."}
                        </div>
                      ) : (
                        <>
                          <div className="p-4 bg-surface border border-border-line flex items-start gap-3">
                            <BadgeCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[13px] font-semibold text-on-surface">
                                Pay at doorstep
                              </p>
                              <p className="text-[12px] text-body-slate mt-1 leading-relaxed">
                                Keep approximately{" "}
                                <span className="font-semibold text-on-surface">
                                  ₹{finalTotal.toLocaleString("en-IN")}
                                </span>{" "}
                                ready in cash or UPI for a smooth handoff.
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 label-caps text-[10px] text-body-slate pt-1">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" /> PCI-DSS
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-primary" /> 256-Bit SSL
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BadgeCheck className="w-3.5 h-3.5 text-primary" /> Purchase Protection
        </span>
      </div>
    </div>
  );
}
