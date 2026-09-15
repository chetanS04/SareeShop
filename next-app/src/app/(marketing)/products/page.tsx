"use client";

import React, { Suspense } from "react";
import ProductsPage from "./ProductsPageContent";

export default function ProductsWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-surface">
                <div className="site-pad section-y">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-2 border-border-line border-t-primary animate-spin"></div>
                        <p className="label-caps text-primary">Loading Collections</p>
                    </div>
                </div>
            </div>}>
            <ProductsPage />
        </Suspense>
    );
}
