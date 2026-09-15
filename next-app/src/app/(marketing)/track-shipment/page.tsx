"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, Package, AlertCircle, HelpCircle, ScanLine, Mail } from "lucide-react";
import TrackingTimelineSv from "@/components/(frontend)/TrackingTimelineSv";
import { DelhiveryTrackingData, trackByWaybill } from "../../../../utils/delhiveryApi";
import ErrorMessage from "@/components/(sheared)/ErrorMessage";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import { useLoader } from "@/context/LoaderContext";

function PublicTrackingContent() {
    const searchParams = useSearchParams();
    const [waybill, setWaybill] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trackingData, setTrackingData] = useState<DelhiveryTrackingData | null>(null);
    const [searched, setSearched] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        const qAwb =
            searchParams.get("waybill") ||
            searchParams.get("awb") ||
            searchParams.get("tracking_id") ||
            searchParams.get("id");
        if (qAwb && !waybill) {
            setWaybill(qAwb);
            executeTrack(qAwb);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const executeTrack = async (awbNumber: string) => {
        if (!awbNumber.trim()) {
            setError("Please enter a waybill number");
            setErrorMessage("Please enter a waybill number");
            setNotFound(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setNotFound(false);
            setSearched(true);
            setErrorMessage(null);
            setTrackingData(null);
            showLoader();

            const response = await trackByWaybill(awbNumber.trim());
            const data = response?.tracking_data ?? null;
            const ok = response?.success !== false && Boolean(data);

            if (!ok) {
                setTrackingData(null);
                setNotFound(true);
                setError(null);
                setSuccessMessage(null);
                return;
            }

            setTrackingData(data);
            setNotFound(false);
            setSuccessMessage("Tracking details loaded.");
        } catch (err: any) {
            const errorMsg =
                err?.message ||
                err?.error ||
                "Failed to fetch tracking information";
            const looksMissing =
                /not found|does not exist|invalid|no (tracking|shipment|data)/i.test(
                    String(errorMsg),
                );
            setTrackingData(null);
            if (looksMissing) {
                setNotFound(true);
                setError(null);
            } else {
                setNotFound(false);
                setError(errorMsg);
                setErrorMessage(errorMsg);
            }
        } finally {
            setLoading(false);
            hideLoader();
        }
    };

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        await executeTrack(waybill);
    };

    return (
        <div className="min-h-screen bg-surface text-on-surface">
            {errorMessage && <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />}
            {successMessage && <SuccessMessage message={successMessage} onClose={() => setSuccessMessage(null)} />}

            {/* MASTHEAD */}
            <section className="w-full bg-surface border-b border-border-line">
                <div className="max-w-site mx-auto site-pad pt-8 sm:pt-10 pb-10 sm:pb-14">
                    <nav className="label-caps text-body-slate mb-8 flex flex-wrap items-center gap-2">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="text-on-surface/30" aria-hidden="true">/</span>
                        <span className="text-body-slate">Orders</span>
                        <span className="text-on-surface/30" aria-hidden="true">/</span>
                        <span className="text-on-surface">Track Shipment</span>
                    </nav>

                    <div className="max-w-2xl mx-auto text-center flex flex-col items-center space-y-5">
                        <div className="inline-flex items-center gap-2 bg-surface-ivory px-3 py-1.5 border border-border-line label-caps text-primary">
                            <ScanLine className="w-3.5 h-3.5" />
                            <span>Live Courier Tracking</span>
                        </div>
                        <h1 className="display-hero text-on-surface">
                            Track Your
                            <br />
                            <span className="text-primary">Shipment</span>
                        </h1>
                        <p className="text-[15px] sm:text-base leading-[1.6] text-body-slate">
                            Enter the waybill (AWB) number from your dispatch email to see the latest
                            status and scan history.
                        </p>
                    </div>
                </div>
            </section>

            {/* BODY */}
            <section className="w-full bg-surface-subtle border-b border-border-line">
                <div className="max-w-site mx-auto site-pad section-y">
                    <div className="max-w-3xl mx-auto space-y-8">

                        {/* Search Form */}
                        <div className="bg-pure-white border border-border-line p-5 sm:p-7">
                            <form onSubmit={handleTrack} className="space-y-4">
                                <label htmlFor="waybill" className="label-caps text-body-slate block">
                                    Waybill / AWB Number
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        id="waybill"
                                        value={waybill}
                                        onChange={(e) => setWaybill(e.target.value)}
                                        placeholder="e.g. 1234567890123"
                                        className="flex-1 px-4 py-3 bg-surface border border-border-line text-[14px] text-on-surface placeholder:text-body-slate/60 outline-none focus:border-on-surface transition-colors"
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !waybill.trim()}
                                        className="sv-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Tracking…
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-4 h-4" />
                                                Track
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-surface-ivory border border-border-line">
                                    <HelpCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    <div className="text-[13px] leading-[1.55] text-body-slate">
                                        <p className="label-caps text-on-surface mb-1">Where to find it</p>
                                        <p>
                                            The waybill number is in your shipment dispatch email and SMS, and on
                                            the <Link href="/orders" className="text-primary underline hover:text-on-surface">My Orders</Link> page once your order ships.
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Error (non-missing failures only) */}
                        {error && !notFound && (
                            <div className="bg-pure-white border-l-2 border-l-primary border-y border-r border-border-line p-5 sm:p-6 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="label-caps text-on-surface mb-1.5">Unable to Track</h3>
                                    <p className="text-[14px] text-body-slate leading-[1.55]">{error}</p>
                                    <p className="text-[13px] text-body-slate/80 mt-2 leading-[1.55]">
                                        Check the number and try again. Tracking can take a few hours to appear
                                        after dispatch.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Results */}
                        {trackingData && <TrackingTimelineSv trackingData={trackingData} />}

                        {/* Waybill does not exist — same empty-state language as scan history */}
                        {searched && notFound && !loading && (
                            <div className="bg-pure-white border border-border-line">
                                <div className="p-5 sm:p-7 border-b border-border-line flex flex-wrap items-center justify-between gap-3">
                                    <h3 className="display-section !text-lg sm:!text-xl text-on-surface">
                                        Shipment Status
                                    </h3>
                                    <span className="inline-flex items-center gap-2 border border-primary px-3 py-1.5 label-caps text-primary">
                                        <span className="w-1.5 h-1.5 bg-primary" aria-hidden="true" />
                                        Not Found
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border-line border-b border-border-line">
                                    <div className="bg-surface p-4">
                                        <p className="label-caps text-body-slate mb-1.5">Waybill</p>
                                        <p className="text-[14px] font-semibold text-on-surface break-all">
                                            {waybill.trim() || "—"}
                                        </p>
                                    </div>
                                    <div className="bg-surface p-4">
                                        <p className="label-caps text-body-slate mb-1.5">Current Location</p>
                                        <p className="text-[14px] text-body-slate">—</p>
                                    </div>
                                    <div className="bg-surface p-4">
                                        <p className="label-caps text-body-slate mb-1.5">Expected Delivery</p>
                                        <p className="text-[14px] text-body-slate">—</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-2 py-14 px-6 text-center">
                                    <AlertCircle className="w-5 h-5 text-body-slate" />
                                    <p className="label-caps text-body-slate tracking-[0.12em]">
                                        Waybill Number Does Not Exist
                                    </p>
                                    <p className="text-[13px] text-body-slate/80 max-w-sm leading-[1.55] mt-1">
                                        No shipment record was found for this AWB. Check the number from your
                                        dispatch email or{" "}
                                        <Link href="/orders" className="text-primary underline hover:text-on-surface">
                                            My Orders
                                        </Link>
                                        , then try again.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* No results fallback */}
                        {searched && !trackingData && !loading && !error && !notFound && (
                            <div className="bg-pure-white border border-border-line">
                                <div className="flex items-center justify-center gap-2 py-14 label-caps text-body-slate">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>No Tracking Found</span>
                                </div>
                            </div>
                        )}

                        {/* Pre-search info */}
                        {!searched && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { icon: ScanLine, title: "Live Status", body: "See the current status straight from the courier." },
                                    { icon: Package, title: "Full Scan History", body: "Every scan with location and timestamp." },
                                    { icon: AlertCircle, title: "Delay Alerts", body: "Spot exceptions like address issues early." },
                                ].map((c) => {
                                    const Icon = c.icon;
                                    return (
                                        <div key={c.title} className="bg-pure-white border border-border-line p-5 space-y-2.5">
                                            <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                                            <h3 className="label-caps text-on-surface">{c.title}</h3>
                                            <p className="text-[13px] text-body-slate leading-[1.55]">{c.body}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Help */}
                        <div className="border-t border-border-line pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <p className="text-[13px] text-body-slate">
                                Timelines and courier details are in our{" "}
                                <Link href="/shipping-policy" className="text-primary underline hover:text-on-surface">
                                    Shipping &amp; Delivery Policy
                                </Link>.
                            </p>
                            <a
                                href="mailto:svastrastore@gmail.com"
                                className="label-caps text-on-surface hover:text-primary transition-colors inline-flex items-center gap-2"
                            >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Email Support</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function PublicTrackingPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-surface flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-border-line border-t-primary animate-spin" />
                </div>
            }
        >
            <PublicTrackingContent />
        </Suspense>
    );
}
