import React from "react";
import { Package, MapPin, Clock, CheckCircle, XCircle, Truck, AlertCircle } from "lucide-react";
import { DelhiveryTrackingData } from "../../../utils/delhiveryApi";

type Props = {
  trackingData: DelhiveryTrackingData;
};

function statusKind(status: string): "done" | "active" | "problem" | "pending" {
  const s = (status || "").toLowerCase();
  if (s.includes("delivered")) return "done";
  if (s.includes("picked")) return "done";
  if (s.includes("out for delivery") || s.includes("transit") || s.includes("dispatched"))
    return "active";
  if (s.includes("cancelled") || s.includes("rto") || s.includes("undelivered") || s.includes("failed"))
    return "problem";
  return "pending";
}

function StatusIcon({ status }: { status: string }) {
  const kind = statusKind(status);
  const cls = "w-4 h-4";
  if (kind === "done") return <CheckCircle className={`${cls} text-primary`} />;
  if (kind === "active") {
    const s = status.toLowerCase();
    return s.includes("out for delivery") ? (
      <Truck className={`${cls} text-primary`} />
    ) : (
      <Package className={`${cls} text-primary`} />
    );
  }
  if (kind === "problem") return <XCircle className={`${cls} text-primary`} />;
  return <Clock className={`${cls} text-body-slate`} />;
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

export default function TrackingTimelineSv({ trackingData }: Props) {
  const scans = trackingData.scans || [];

  return (
    <div className="bg-pure-white border border-border-line">
      {/* Header */}
      <div className="p-5 sm:p-7 border-b border-border-line">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h3 className="display-section !text-lg sm:!text-xl text-on-surface">Shipment Status</h3>
          <span className="inline-flex items-center gap-2 border border-primary px-3 py-1.5 label-caps text-primary">
            <span className="w-1.5 h-1.5 bg-primary" aria-hidden="true" />
            {trackingData.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border-line border border-border-line">
          <div className="bg-surface p-4">
            <p className="label-caps text-body-slate mb-1.5">Waybill</p>
            <p className="text-[14px] font-semibold text-on-surface break-all">{trackingData.waybill}</p>
          </div>
          <div className="bg-surface p-4">
            <p className="label-caps text-body-slate mb-1.5">Current Location</p>
            <p className="text-[14px] font-semibold text-on-surface flex items-center gap-1.5">
              {trackingData.current_location ? (
                <>
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  {trackingData.current_location}
                </>
              ) : (
                <span className="text-body-slate font-normal">—</span>
              )}
            </p>
          </div>
          <div className="bg-surface p-4">
            <p className="label-caps text-body-slate mb-1.5">Expected Delivery</p>
            <p className="text-[14px] font-semibold text-on-surface flex items-center gap-1.5">
              {trackingData.expected_delivery ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  {formatDate(trackingData.expected_delivery)}
                </>
              ) : (
                <span className="text-body-slate font-normal">—</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-5 sm:p-7">
        {scans.length > 0 ? (
          <ol className="relative list-none p-0 m-0">
            <span
              className="absolute left-[15px] top-2 bottom-2 w-px bg-border-line"
              aria-hidden="true"
            />
            {scans.map((scan, index) => {
              const kind = statusKind(scan.scan_detail);
              const isLatest = index === 0;
              return (
                <li key={index} className="relative flex gap-4 pb-6 last:pb-0">
                  <span
                    className={`relative z-10 flex items-center justify-center w-8 h-8 shrink-0 border ${
                      kind === "pending"
                        ? "border-border-line bg-surface"
                        : "border-primary bg-surface-ivory"
                    }`}
                  >
                    <StatusIcon status={scan.scan_detail} />
                  </span>

                  <div
                    className={`flex-1 min-w-0 border p-4 ${
                      isLatest ? "border-on-surface bg-surface-subtle" : "border-border-line bg-surface"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 mb-1.5">
                      <h4 className="text-[13px] font-bold uppercase tracking-[0.02em] text-on-surface">
                        {scan.scan_detail}
                      </h4>
                      <span className="label-caps text-body-slate flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatDate(scan.scan_date)}
                      </span>
                    </div>
                    {scan.location && (
                      <p className="text-[13px] text-body-slate flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-body-slate/70" />
                        {scan.location}
                      </p>
                    )}
                    {scan.instructions && (
                      <p className="text-[12px] text-body-slate/80 mt-2 leading-relaxed">
                        {scan.instructions}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="flex items-center justify-center gap-2 py-10 label-caps text-body-slate">
            <AlertCircle className="w-4 h-4" />
            <span>No scan history yet</span>
          </div>
        )}
      </div>

      {trackingData.status_date && (
        <div className="px-5 sm:px-7 py-4 border-t border-border-line">
          <p className="label-caps text-body-slate text-center">
            Last updated {formatDate(trackingData.status_date)}
          </p>
        </div>
      )}
    </div>
  );
}
