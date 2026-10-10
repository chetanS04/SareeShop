"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Check,
  Folder,
  FolderPlus,
  Search,
  ArrowRight,
  Loader2,
  Sparkles,
  ExternalLink,
  Layers,
} from "lucide-react";
import { useAddProductModal } from "@/context/AddProductModalContext";
import { getCategories, getCategoryByIdForProduct } from "../../../utils/category";
import { getImageUrl } from "../../../utils/imageUtils";
import { clearEditProductId } from "../../../utils/product";

interface CategoryItem {
  id: string | number;
  name: string;
  description?: string | null;
  image?: string | null;
  secondary_image?: string | null;
  status?: boolean;
  attributes?: any[];
}

export default function AddProductSelectionModal() {
  const { isOpen, closeAddProductModal } = useAddProductModal();
  const router = useRouter();

  // Selection states
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

  // Loading states
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search filter
  const [categorySearch, setCategorySearch] = useState("");

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategoriesList();
      setSelectedCategory(null);
      setCategorySearch("");
      setErrorMsg(null);
      setIsNavigating(false);
    }
  }, [isOpen]);

  const loadCategoriesList = async () => {
    setIsLoadingCategories(true);
    setErrorMsg(null);
    try {
      const data = await getCategories({ limit: 100 });
      let list: CategoryItem[] = [];
      if (data && data.data && Array.isArray(data.data.categories)) {
        list = data.data.categories;
      } else if (data && Array.isArray(data.categories)) {
        list = data.categories;
      } else if (Array.isArray(data)) {
        list = data;
      }
      setCategories(list);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to load categories. Please try again.");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase().trim())
    );
  }, [categories, categorySearch]);

  // Navigate to Categories page
  const handleGoToCategories = () => {
    closeAddProductModal();
    router.push("/dashboard/categories");
  };

  // Handle Continue / Add Product
  const handleContinue = async (catToUse?: CategoryItem) => {
    const cat = catToUse || selectedCategory;
    if (!cat) return;

    clearEditProductId();
    setIsNavigating(true);
    setErrorMsg(null);

    const targetCatId = cat.id;

    try {
      // Fetch full details with attributes for the selected category
      const res = await getCategoryByIdForProduct(String(cat.id));
      const categoryData = res?.result || res?.category || res?.data;
      const attributes = categoryData?.attributes || [];
      const attrCount = attributes.length;

      closeAddProductModal();

      if (attrCount === 0) {
        router.push(
          `/dashboard/categories/${targetCatId}/products/add-single-variant`
        );
      } else if (attrCount === 1) {
        router.push(
          `/dashboard/categories/${targetCatId}/products/add-single-attribute-product`
        );
      } else {
        router.push(
          `/dashboard/categories/${targetCatId}/products/add-multi-variant`
        );
      }
    } catch (err: any) {
      console.error("Error resolving category attributes:", err);
      // Fallback check on category's local attributes array
      const localAttrs = cat.attributes || [];
      const count = localAttrs.length;

      closeAddProductModal();

      if (count === 0) {
        router.push(
          `/dashboard/categories/${targetCatId}/products/add-single-variant`
        );
      } else if (count === 1) {
        router.push(
          `/dashboard/categories/${targetCatId}/products/add-single-attribute-product`
        );
      } else {
        router.push(
          `/dashboard/categories/${targetCatId}/products/add-multi-variant`
        );
      }
    } finally {
      setIsNavigating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ──── Header ──── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 via-white to-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#007FFF]/10 text-[#007FFF] flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                Select Category to Add Product
              </h2>
              <p className="text-xs text-gray-500">
                Choose the direct category where this product will be created
              </p>
            </div>
          </div>
          <button
            onClick={closeAddProductModal}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ──── Search Bar ──── */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search category by name..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all"
            />
            {categorySearch && (
              <button
                onClick={() => setCategorySearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ──── Categories List ──── */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-2 min-h-0 [scrollbar-width:thin]">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200">
              {errorMsg}
            </div>
          )}

          {isLoadingCategories ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            /* No Categories Exist */
            <div className="py-12 flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <FolderPlus className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                No categories found
              </h3>
              <p className="text-xs text-gray-500 max-w-[260px] mb-4 leading-relaxed">
                You must have at least one category before adding products.
              </p>
              <button
                type="button"
                onClick={handleGoToCategories}
                className="px-4 py-2 rounded-xl bg-[#007FFF] hover:bg-[#0066CC] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Go to Categories</span>
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No category matching &quot;{categorySearch}&quot;
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              const imgUrl = cat.image ? getImageUrl(cat.image) : null;
              const catAttrs = cat.attributes || [];

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  onDoubleClick={() => handleContinue(cat)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/90 border-[#007FFF] text-[#007FFF] shadow-xs ring-1 ring-blue-400/30"
                      : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={cat.name}
                        className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-blue-100 text-[#007FFF]"
                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                        }`}
                      >
                        <Folder className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isSelected ? "text-blue-950 font-bold" : "text-gray-900"
                        }`}
                      >
                        {cat.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {catAttrs.length === 0 ? (
                          <span className="text-[11px] text-gray-400">
                            Single Variant (No attributes)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            <Layers className="w-3 h-3" />
                            {catAttrs.length === 1
                              ? "Single Attribute Product"
                              : "Multi-Variant Product"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#007FFF] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-gray-300 group-hover:border-gray-400 flex items-center justify-center" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ──── Footer ──── */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-t border-gray-100 bg-gray-50/80">
          <button
            type="button"
            onClick={handleGoToCategories}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Manage Categories</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeAddProductModal}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedCategory || isNavigating}
              onClick={() => handleContinue()}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#007FFF] to-[#0055CC] hover:from-[#0066CC] hover:to-[#0044BB] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isNavigating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
