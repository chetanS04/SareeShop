"use client";

import React from "react";
import {
  BadgeCheck,
  CreditCard,
  Lock,
  ShieldCheck,
  Smartphone,
  Loader2,
  Sparkles,
} from "lucide-react";

export type PaymentMethodValue = "cod" | "online";
export type PaymentChannel = "upi" | "card" | "netbanking" | "cod";

type SecurePaymentPanelProps = {
  paymentMethod: PaymentMethodValue;
  onChange: (method: PaymentMethodValue, channel?: PaymentChannel) => void;
  isCodDisabled?: boolean;
  codDisabledReason?: React.ReactNode;
  finalTotal: number;
  onPayNowOnline?: () => void;
  loading?: boolean;
};

export default function SecurePaymentPanel({
  paymentMethod,
  onChange,
  isCodDisabled = false,
  codDisabledReason,
  finalTotal,
  onPayNowOnline,
  loading = false,
}: SecurePaymentPanelProps) {
  const select = (next: PaymentMethodValue) => {
    if (next === "cod" && isCodDisabled) return;
    onChange(next);
  };

  const isOnline = paymentMethod === "online";
  const isCod = paymentMethod === "cod";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
          <span className="label-caps text-[10px] tracking-widest font-semibold">
            Authentic &amp; Protected
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-on-surface">
          Select Payment Method
        </h2>
        <p className="text-[14px] sm:text-[15px] text-body-slate max-w-2xl leading-relaxed">
          Choose between instant online payment via Razorpay or Cash on Delivery.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {/* OPTION 1: Pay Online via Razorpay */}
        <div
          className={`border transition-all ${
            isOnline
              ? "border-primary bg-surface-ivory shadow-xs"
              : "border-border-line bg-surface-subtle hover:border-body-slate/40"
          }`}
        >
          <button
            type="button"
            onClick={() => select("online")}
            className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  isOnline ? "border-primary" : "border-body-slate/40"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOnline ? "bg-primary" : "bg-transparent"
                  }`}
                />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight text-on-surface">
                    Pay Online
                  </h3>
                  <span className="label-caps text-[9px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 font-bold">
                    Instant &amp; Zero Surcharge
                  </span>
                </div>
                <p className="text-[12px] text-body-slate mt-0.5">
                  UPI (GPay, PhonePe, Paytm, QR Code), Cards, Net Banking &amp; Wallets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary shrink-0">
              <Smartphone className="w-5 h-5" />
              <CreditCard className="w-5 h-5" />
            </div>
          </button>

          {isOnline && (
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-border-line/60">
              <div className="pt-4 space-y-4">
                {/* Method Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    "UPI (Google Pay, PhonePe, Paytm)",
                    "Dynamic QR Code",
                    "Credit / Debit Card",
                    "Net Banking (50+ Banks)",
                    "Wallets",
                  ].map((label) => (
                    <span
                      key={label}
                      className="label-caps text-[10px] px-2.5 py-1 bg-surface border border-border-line text-on-surface flex items-center gap-1.5"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-primary" />
                      {label}
                    </span>
                  ))}
                </div>

                <div className="p-3.5 bg-surface border border-border-line text-[12px] text-body-slate flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Secured by <strong>Razorpay</strong> with 256-Bit SSL encryption. Click below or proceed to open the Razorpay checkout to complete your payment instantly.
                  </span>
                </div>

                {onPayNowOnline && (
                  <button
                    type="button"
                    onClick={onPayNowOnline}
                    disabled={loading}
                    className="sv-btn-primary w-full !py-3 !px-4 !text-[12px] !gap-2 cursor-pointer shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Opening Razorpay Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay ₹{Math.round(finalTotal).toLocaleString("en-IN")} via Razorpay Now</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* OPTION 2: Cash on Delivery */}
        <div
          className={`border transition-all ${
            isCod
              ? "border-primary bg-surface-ivory shadow-xs"
              : "border-border-line bg-surface-subtle hover:border-body-slate/40"
          } ${isCodDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <button
            type="button"
            disabled={isCodDisabled}
            onClick={() => select("cod")}
            className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  isCod ? "border-primary" : "border-body-slate/40"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isCod ? "bg-primary" : "bg-transparent"
                  }`}
                />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight text-on-surface">
                    Cash on Delivery
                  </h3>
                  <span className="label-caps text-[9px] px-2 py-0.5 bg-surface text-on-surface border border-border-line font-medium">
                    {isCodDisabled ? "Unavailable" : "Doorstep"}
                  </span>
                </div>
                <p className="text-[12px] text-body-slate mt-0.5">
                  {isCodDisabled
                    ? "Unavailable for one or more items in your order"
                    : "Pay with cash or UPI upon delivery at your doorstep"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-body-slate shrink-0">
              <BadgeCheck className={`w-5 h-5 ${isCod ? "text-primary" : ""}`} />
            </div>
          </button>

          {isCod && (
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-border-line/60">
              <div className="pt-4 space-y-3">
                {isCodDisabled ? (
                  <div className="p-3 bg-surface border border-primary text-[12px] text-primary">
                    {codDisabledReason || "Cash on Delivery is unavailable for items in your bag."}
                  </div>
                ) : (
                  <div className="p-4 bg-surface border border-border-line flex items-start gap-3">
                    <BadgeCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-semibold text-on-surface">
                        Pay at Doorstep
                      </p>
                      <p className="text-[12px] text-body-slate mt-1 leading-relaxed">
                        Please keep{" "}
                        <span className="font-semibold text-on-surface">
                          ₹{Math.round(finalTotal).toLocaleString("en-IN")}
                        </span>{" "}
                        ready in cash or UPI for a smooth delivery handoff.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 label-caps text-[10px] text-body-slate pt-1">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Razorpay Verified
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-primary" /> 256-Bit SSL Encrypted
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BadgeCheck className="w-3.5 h-3.5 text-primary" /> 100% Purchase Protection
        </span>
      </div>
    </div>
  );
}
