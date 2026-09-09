"use client";

import { useEffect, useMemo, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup.js";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import * as yup from "yup";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });
import { ApiResponse, Brand, Product } from "@/common/interface";
import { useLoader } from "@/context/LoaderContext";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ImageCropperModal from "@/components/(frontend)/ImageCropperModal";
import { createProduct, getProductById, updateProduct, setEditProductId, getEditProductId, clearEditProductId } from "../../../../../../../../utils/product";
import { fetchBrands } from "../../../../../../../../utils/brand";

const schema = yup.object({
    name: yup.string().required("Name is required").min(2),
    sku: yup.string().required("SKU is required"),
    mrp: yup
        .number()
        .typeError("MRP must be a number")
        .required("MRP is required")
        .positive("MRP must be greater than 0")
        .max(9999999.99, "MRP exceeds limit"),
    sp: yup
        .number()
        .typeError("Selling Price (BP) must be a number")
        .required("Base Price / Selling Price (BP) is required")
        .positive("Selling Price (BP) must be greater than 0")
        .max(9999999.99, "Selling Price (BP) exceeds limit")
        .test("sp-less-mrp", "Selling Price (BP) cannot be greater than MRP", function (value) {
            const { mrp } = this.parent;
            return !mrp || !value || value <= mrp;
        }),
    bp: yup
        .number()
        .typeError("Buying Price must be a number")
        .required("Buying Price is required")
        .positive("Buying Price must be greater than 0")
        .max(9999999.99, "Buying Price exceeds limit"),
    stock: yup
        .number()
        .typeError("Stock value must be a number")
        .required("Stock is required")
        .min(0, "Stock must be greater than or equal to 0")
        .max(100000, "Stock exceeds limit"),
    is_cod_allowed: yup.boolean().default(true),
    is_returnable: yup.boolean().default(true),
    return_window_days: yup.number().typeError("Return days must be a number").min(0, "Cannot be negative").max(90, "Cannot exceed 90 days").default(7),
    shipping_charges: yup.number().typeError("Shipping charges must be a number").min(0, "Cannot be negative").default(0),
    description: yup.string(),
    itemCode: yup.string().nullable(),
    categoryId: yup.string().required("Category is required"),
    brandId: yup.string().required("Brand is required"),
    hsn: yup
        .string()
        .transform((val) => (val ? String(val).trim() : ""))
        .required("HSN code is required")
        .max(15, "HSN code cannot exceed 15 characters"),
    cgst: yup
        .number()
        .transform((val, orig) => (orig === "" || orig === null || orig === undefined ? undefined : val))
        .typeError("CGST must be a valid number")
        .required("CGST is required")
        .min(0, "CGST cannot be negative")
        .max(99.99, "CGST must be below 100"),
    sgst: yup
        .number()
        .transform((val, orig) => (orig === "" || orig === null || orig === undefined ? undefined : val))
        .typeError("SGST must be a valid number")
        .required("SGST is required")
        .min(0, "SGST cannot be negative")
        .max(99.99, "SGST must be below 100"),
    igst: yup
        .number()
        .transform((val, orig) => (orig === "" || orig === null || orig === undefined ? undefined : val))
        .typeError("IGST must be a valid number")
        .required("IGST is required")
        .min(0, "IGST cannot be negative")
        .max(99.99, "IGST must be below 100"),
    status: yup.boolean().default(true),
    image_url: yup.string().required("Primary image is required"),
    detailJson: yup.array(
        yup.object({
            key: yup.string().required("Detail Key is required"),
            value: yup.string().required("Detail Value is required"),
        })
    ),
    featureJson: yup.array(
        yup.object({
            value: yup.string().required("Feature is required"),
        })
    ),
    imageJson: yup.array().of(yup.string()),
});

type FormData = yup.InferType<typeof schema>;

const disableScrollNumberInput = (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur();

const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_BASE ?? "https://api.zelton.co.in";

function ProductForm() {
    const [preview, setPreview] = useState<string | null>(null);
    const [multiPreview, setMultiPreview] = useState<string[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [variantId, setVariantId] = useState<string | number | null>(null);
    const { showLoader, hideLoader } = useLoader();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error" | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const [productId, setProductId] = useState<string | null>(null);
    const categoryId = (params?.slug || params?.id || "") as string;

    useEffect(() => {
        const idFromStorage = getEditProductId();
        const idFromQuery = searchParams?.get("productId");
        const effectiveId = idFromStorage || idFromQuery;
        if (effectiveId) {
            setProductId(effectiveId);
            setEditProductId(effectiveId);
            if (idFromQuery) {
                const url = new URL(window.location.href);
                url.searchParams.delete("productId");
                window.history.replaceState({}, "", url.toString());
            }
        }
    }, [searchParams]);

    const config = useMemo(
        () => ({
            "uploader": {
                "insertImageAsBase64URI": true
            },
            showPlaceholder: false,
            readonly: false,
            buttons: "bold,italic,underline,ul,ol,link,undo,redo",
            toolbarAdaptive: true,
            toolbarSticky: false,
            buttonsMD: "bold,italic,underline,ul,ol,link",
            buttonsSM: "bold,italic,ul,ol",
            buttonsXS: "bold,italic,ul",
            askBeforePasteHTML: false,
            askBeforePasteFromWord: false,
            defaultActionOnPaste: 'insert_clear_html' as any,
            style: {
                minHeight: "100px",
                fontSize: "14px"
            }
        }),
        []
    );

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm<any>({
        resolver: yupResolver(schema),
        defaultValues: {
            description: "",
            featureJson: [],
            imageJson: [],
            detailJson: [],
            hsn: "",
            cgst: "",
            sgst: "",
            igst: "",
            categoryId: categoryId || "",
        },
    });

    useEffect(() => {
        const loadForm = async () => {
            showLoader();
            try {
                const brandsData = await fetchBrands({ status: "active" });
                const list: Brand[] = Array.isArray(brandsData) ? brandsData : (brandsData?.brands || brandsData?.data?.brands || []);
                const bList = list.filter((brand: Brand) => Boolean(brand.status));
                setBrands(bList);

                if (productId) {
                    const res = await getProductById(productId);
                    if (res.success && res.result) {
                        const product = res.result;

                        const attrCount = product.item_attributes?.length ?? product.itemAttributes?.length ?? 0;
                        if (attrCount === 1) {
                            setEditProductId(productId);
                            router.replace(`/dashboard/categories/${categoryId}/products/add-single-attribute-product`);
                            return;
                        } else if (attrCount > 1 || (product.variants && product.variants.length > 1)) {
                            setEditProductId(productId);
                            router.replace(`/dashboard/categories/${categoryId}/products/add-multi-variant`);
                            return;
                        }

                        setValue("name", product.name);
                        setValue("description", product.description);
                        setValue("itemCode", product.item_code);
                        if (product.category_id || product.categoryId) {
                            setValue("categoryId", String(product.category_id ?? product.categoryId));
                        }
                        const bId = String(product.brandId ?? product.brand_id ?? product.brand?.id ?? "");
                        if (bId) {
                            setValue("brandId", bId);
                        } else if (bList.length > 0) {
                            setValue("brandId", String(bList[0].id));
                        }

                        setValue("status", Boolean(product.status));
                        setValue("hsn", product.hsn ?? "");
                        setValue("cgst", product.cgst !== null && product.cgst !== undefined ? product.cgst : "");
                        setValue("sgst", product.sgst !== null && product.sgst !== undefined ? product.sgst : "");
                        setValue("igst", product.igst !== null && product.igst !== undefined ? product.igst : "");
                        setValue("image_url", product.image_url || "");
                        setValue("detailJson", product.detail_json ? JSON.parse(product.detail_json) : []);
                        setValue("featureJson", product.feature_json ? JSON.parse(product.feature_json).map((v: string) => ({ value: v })) : []);
                        setValue("imageJson", product.image_json ? JSON.parse(product.image_json) : []);

                        if (product.variants && product.variants.length > 0) {
                            const v0 = product.variants[0];
                            setVariantId(v0.id);
                            setValue("sku", v0.sku);
                            setValue("mrp", v0.mrp);
                            setValue("bp", v0.bp);
                            setValue("sp", v0.sp);
                            setValue("stock", v0.stock);
                            setValue("is_cod_allowed", v0.is_cod_allowed !== undefined ? Boolean(v0.is_cod_allowed) : (v0.isCodAllowed !== undefined ? Boolean(v0.isCodAllowed) : true));
                            setValue("is_returnable", v0.is_returnable !== undefined ? Boolean(v0.is_returnable) : (v0.isReturnable !== undefined ? Boolean(v0.isReturnable) : true));
                            setValue("return_window_days", v0.return_window_days !== undefined && v0.return_window_days !== null ? Number(v0.return_window_days) : (v0.returnWindowDays !== undefined && v0.returnWindowDays !== null ? Number(v0.returnWindowDays) : 7));
                            setValue("shipping_charges", v0.shipping_charges !== undefined && v0.shipping_charges !== null ? Number(v0.shipping_charges) : (v0.shippingCharges !== undefined && v0.shippingCharges !== null ? Number(v0.shippingCharges) : 0));
                        }

                        setValue("variants", product.variants || []);
                        setPreview(product.image_url || null);
                        setMultiPreview(product.image_json ? JSON.parse(product.image_json) : []);
                    }
                } else if (bList.length > 0) {
                    setValue("brandId", String(bList[0].id));
                }
            } catch (err) {
                console.error(err);
            } finally {
                hideLoader();
            }
        };
        loadForm();
    }, [productId]);

    const { fields: featureFields, append: featureAppend, remove: featureRemove } = useFieldArray({
        control,
        name: "featureJson",
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "detailJson",
    });

    const onSubmit = async (data: FormData) => {
        const variant: any = {
            mrp: data.mrp,
            stock: data.stock,
            bp: data.bp,
            sp: data.sp,
            sku: data.sku,
            is_cod_allowed: data.is_cod_allowed ?? true,
            is_returnable: data.is_returnable ?? true,
            return_window_days: data.return_window_days ?? 7,
            shipping_charges: data.shipping_charges ?? 0,
        };

        // Include variant ID if updating
        if (productId && variantId && !isNaN(Number(variantId))) {
            variant.id = Number(variantId);
        }

        const payload = {
            name: data.name,
            description: data.description,
            itemCode: data.itemCode,
            item_code: data.itemCode,
            category_id: data.categoryId,
            categoryId: data.categoryId,
            brand_id: data.brandId ? Number(data.brandId) : null,
            brandId: data.brandId ? Number(data.brandId) : null,
            status: data.status ?? true,
            hsn: data.hsn ? String(data.hsn).trim() : null,
            cgst: data.cgst !== undefined && data.cgst !== null && (data.cgst as any) !== "" ? String(data.cgst) : null,
            sgst: data.sgst !== undefined && data.sgst !== null && (data.sgst as any) !== "" ? String(data.sgst) : null,
            igst: data.igst !== undefined && data.igst !== null && (data.igst as any) !== "" ? String(data.igst) : null,
            detailList: data.detailJson || [],
            detail_json: JSON.stringify(data.detailJson || []),
            featureList: data.featureJson?.map(feature => feature.value) || [],
            feature_json: JSON.stringify(data.featureJson?.map(feature => feature.value) || []),
            image_url: data.image_url ?? null,
            imageUrl: data.image_url ?? null,
            imageList: data.imageJson || [],
            image_json: JSON.stringify(data.imageJson || []),
            variants: [variant],
        };

        try {
            let res: ApiResponse<string>;

            if (productId) {
                res = await updateProduct(productId, payload as any);
            } else {
                res = await createProduct(payload as any);
            }

            if (res.success) {
                setSuccessMessage(res.message || "Success!");
                setTimeout(() => router.push(`/dashboard/categories/${categoryId}/products`), 4000);
            } else {
                if (res.errors) {
                    const errorMessages = Object.values(res.errors).flat().join(' ');
                    setErrorMessage(errorMessages || res.message || "An error occurred.");
                } else {
                    setErrorMessage(res.message || "An error occurred.");
                }
            }
        } catch (err) {
            console.error("Submit error:", err);
            setErrorMessage(productId ? "Failed to update product" : "Failed to create product");
        } finally {
            hideLoader();
        }
    };

    useEffect(() => {
        if (successMessage) {
            setToastType("success");
            setToastMessage(successMessage);
            setShowToast(true);
        } else if (errorMessage) {
            setToastType("error");
            setToastMessage(errorMessage);
            setShowToast(true);
        }
    }, [successMessage, errorMessage]);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
                if (successMessage) {
                    router.push(`/dashboard/categories/${categoryId}/products`);
                }
                setSuccessMessage(null);
                setErrorMessage(null);
                setToastMessage(null);
                setToastType(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const disableScrollNumberInput = (e: React.WheelEvent<HTMLInputElement>) => {
        e.currentTarget.blur();
    };

    return (
        <div className="w-full mx-auto bg-white/90 relative">
            {/* header */}
            <div className="max-w-[70rem] mx-auto top-0 z-50 px-4 pt-4">
                <div className="p-3 md:p-5 bg-white/80 backdrop-blur border border-gray-200 rounded-2xl shadow-lg mb-5">

                    <div className="flex items-center justify-between">
                        {/* Title */}
                        <h2 className="text-lg md:text-xl lg:text-3xl font-bold px-2 md:px-5 text-gray-900 tracking-tight">
                            {productId ? "Update Product" : "Fill Product Details"}
                        </h2>
                    </div>

                </div>
            </div>
            {showToast && toastMessage && (
                <div className={`fixed top-6 right-6 z-[9999] px-6 py-4 rounded shadow-lg font-semibold transition-all
                    ${toastType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {toastMessage}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-[70rem] mx-auto px-3 md:px-4 pb-4">
                <div className="border border-gray-300 rounded-xl p-3 md:p-6 bg-white flex flex-col gap-4 md:gap-6 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm md:text-base font-semibold text-black mb-1">Name<span className="text-red-600">*</span></label>
                            <input
                                {...register("name")}
                                type="text"
                                placeholder="Enter product name"
                                className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 focus:border-[#007FFF] focus:ring-2 focus:ring-blue-100 transition"
                            />
                            <p className="text-sm text-red-500">{errors.name?.message as any}</p>
                        </div>
                        {/* SKU */}
                        <div>
                            <label className="block text-sm md:text-base font-semibold text-black mb-1">SKU<span className="text-red-600">*</span></label>
                            <input
                                {...register("sku")}
                                type="text"
                                placeholder="Enter SKU"
                                className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 focus:border-[#007FFF] focus:ring-2 focus:ring-blue-100 transition"
                            />
                            <p className="text-sm text-red-500">{errors.sku?.message as any}</p>
                        </div>
                        {/* MRP */}
                        <div>
                            <label className="block text-sm md:text-base font-semibold text-black mb-1">MRP (Maximum Retail Price)<span className="text-red-600">*</span></label>
                            <input
                                {...register("mrp")}
                                type="number"
                                onWheel={disableScrollNumberInput}
                                step="0.01"
                                placeholder="Enter MRP"
                                className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 focus:border-[#007FFF] focus:ring-2 focus:ring-blue-100 transition"
                            />
                            <p className="text-sm text-red-500">{errors.mrp?.message as any}</p>
                        </div>
                        {/* Selling Price / Base Price (sp) */}
                        <div>
                            <label className="block text-sm md:text-base font-semibold text-black mb-1">Base Price / Selling Price (BP)<span className="text-red-600">*</span></label>
                            <input
                                {...register("sp")}
                                type="number"
                                step="0.01"
                                onWheel={disableScrollNumberInput}
                                placeholder="Enter Selling Price (BP)"
                                className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] text-black border border-gray-300 focus:border-[#007FFF] focus:ring-2 focus:ring-blue-100 transition"
                            />
                            <p className="text-sm text-red-500">{errors.sp?.message as any}</p>
                        </div>
                        {/* Buying Price (bp) */}
                        <div>
                            <label className="block text-sm md:text-base font-semibold text-black mb-1">Buying Price (Cost Price)<span className="text-red-600">*</span></label>
                            <input
                                {...register("bp")}
                                type="number"
                                onWheel={disableScrollNumberInput}
                                step="0.01"
                                placeholder="Enter Buying Cost Price"
                                className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 focus:border-[#007FFF] focus:ring-2 focus:ring-blue-100 transition"
                            />
                            <p className="text-sm text-red-500">{errors.bp?.message as any}</p>
                        </div>
                        {/* Loss Warning Banner */}
                        {watch("bp") && watch("sp") && Number(watch("bp")) > Number(watch("sp")) && (
                            <div className="sm:col-span-2 p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-xs sm:text-sm flex items-center gap-2">
                                <span>⚠️</span>
                                <span>
                                    <strong>Warning:</strong> Product will be sold at a loss! Buying Price (₹{watch("bp")}) is greater than Selling Price (₹{watch("sp")}).
                                </span>
                            </div>
                        )}
                        {/* Stock */}
                        <div>
                            <label className="block text-sm md:text-base font-semibold text-black mb-1">Stock<span className="text-red-600">*</span></label>
                            <input
                                {...register("stock")}
                                type="number"
                                step="1"
                                onWheel={disableScrollNumberInput}
                                placeholder="Enter Stock"
                                className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 focus:border-[#007FFF] focus:ring-2 focus:ring-blue-100 transition"
                            />
                            <p className="text-sm text-red-500">{errors.stock?.message as any}</p>
                        </div>
                        {/* Shipping Charges */}
                        <div>
                            <label className="block text-sm md:text-base font-semibold text-black mb-1">
                                Shipping Charges (₹)
                                <span className="text-xs text-gray-500 font-normal ms-1">(0 for Free)</span>
                            </label>
                            <input
                                {...register("shipping_charges")}
                                type="number"
                                step="0.01"
                                defaultValue={0}
                                onWheel={disableScrollNumberInput}
                                placeholder="0.00"
                                className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 focus:border-[#007FFF] focus:ring-2 focus:ring-blue-100 transition"
                            />
                            <p className="text-sm text-red-500">{(errors as any).shipping_charges?.message}</p>
                        </div>

                        {/* COD & Return Policy Controls */}
                        <div className="sm:col-span-2 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                {/* COD Toggle */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200">
                                    <div>
                                        <span className="text-sm font-bold text-gray-800 block">Cash on Delivery (COD)</span>
                                        <span className="text-xs text-gray-500">
                                            {watch("is_cod_allowed") !== false ? "COD Enabled for this product" : "Prepaid Only (COD Disabled)"}
                                        </span>
                                    </div>
                                    <div
                                        className="cursor-pointer select-none"
                                        onClick={() => {
                                            const current = watch("is_cod_allowed");
                                            setValue("is_cod_allowed", current === false ? true : false);
                                        }}
                                    >
                                        <div className={`relative flex items-center h-6 w-11 rounded-full transition-all duration-300 ${watch("is_cod_allowed") !== false ? "bg-emerald-500" : "bg-zinc-300"}`}>
                                            <span className={`absolute h-5 w-5 rounded-full bg-white shadow-sm transform transition-all duration-300 ${watch("is_cod_allowed") !== false ? "translate-x-5" : "translate-x-0.5"}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Returnable Toggle */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200">
                                    <div>
                                        <span className="text-sm font-bold text-gray-800 block">Product Returnable</span>
                                        <span className="text-xs text-gray-500">
                                            {watch("is_returnable") !== false ? "Returns & Replacements Allowed" : "Non-Returnable (Final Sale)"}
                                        </span>
                                    </div>
                                    <div
                                        className="cursor-pointer select-none"
                                        onClick={() => {
                                            const current = watch("is_returnable");
                                            setValue("is_returnable", current === false ? true : false);
                                        }}
                                    >
                                        <div className={`relative flex items-center h-6 w-11 rounded-full transition-all duration-300 ${watch("is_returnable") !== false ? "bg-[#007FFF]" : "bg-zinc-300"}`}>
                                            <span className={`absolute h-5 w-5 rounded-full bg-white shadow-sm transform transition-all duration-300 ${watch("is_returnable") !== false ? "translate-x-5" : "translate-x-0.5"}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Return Window Days (Only if returnable) */}
                            {watch("is_returnable") !== false ? (
                                <div className="flex items-center gap-3 pt-1">
                                    <label className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                                        Return Window (Days):
                                    </label>
                                    <input
                                        {...register("return_window_days")}
                                        type="number"
                                        onWheel={disableScrollNumberInput}
                                        min="1"
                                        max="90"
                                        defaultValue={7}
                                        placeholder="7"
                                        className="w-24 px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs text-gray-900 font-semibold focus:border-[#007FFF] focus:ring-1 focus:ring-blue-100"
                                    />
                                    <span className="text-xs text-gray-500">days allowed for return after courier delivery</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 pt-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                                    <span>⚠️ Customer will see <strong>Non-Returnable</strong> on product page and checkout.</span>
                                </div>
                            )}
                        </div>

                        {/* Item Code */}
                        <div>
                            <label className="block text-base font-semibold text-black mb-1">Item Code</label>
                            <input
                                {...register("itemCode")}
                                type="text"
                                placeholder="Enter item code"
                                className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 focus:border-[#007FFF] focus:ring-2 focus:ring-blue-100 transition"
                            />
                            <p className="text-sm text-red-500">{errors.itemCode?.message as any}</p>
                        </div>
                        {/* Brand */}
                        <div>
                            <label className="block text-base font-semibold text-black mb-1">Brand<span className="text-red-600">*</span></label>
                            <select
                                {...register("brandId")}
                                className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 focus:border-[#007FFF] focus:ring-2 focus:ring-blue-100 transition"
                            >
                                <option value="">-- Select Brand --</option>
                                {brands.map((brand) => (
                                    <option key={brand.id} value={brand.id}>
                                        {brand.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-red-500">{errors.brandId?.message as any}</p>
                        </div>
                        {/* Description */}
                        <div className="w-full sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <Controller
                                name="description"
                                control={control}
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <JoditEditor
                                        value={value}
                                        config={config}
                                        onBlur={(newContent) => onChange(newContent)}
                                    />
                                )}
                            />
                            <p className="text-sm text-red-500">{errors.description?.message as any}</p>
                        </div>

                        {/* Tax & GST Configuration (HSN, CGST, SGST, IGST) */}
                        <div className="w-full sm:col-span-2 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs md:text-sm font-bold text-gray-900">Tax & GST Configuration</span>
                                <span className="text-red-500 font-bold text-sm">*</span>
                            </div>

                            {/* HSN Code */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    HSN Code <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(Max 15 characters)</span>
                                </label>
                                <input
                                    {...register("hsn")}
                                    type="text"
                                    maxLength={15}
                                    placeholder="e.g. 61091000"
                                    className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-[#007FFF] transition text-sm"
                                />
                                <p className="text-xs text-red-500 mt-1">{errors.hsn?.message as any}</p>
                            </div>

                            {/* GST Percentages */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        CGST (%) <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(&lt; 100)</span>
                                    </label>
                                    <input
                                        {...register("cgst")}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="99.99"
                                        onWheel={disableScrollNumberInput}
                                        placeholder="e.g. 9.00"
                                        className="w-full py-2 px-3 rounded-lg bg-white border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-[#007FFF] transition text-sm"
                                    />
                                    <p className="text-xs text-red-500 mt-1">{errors.cgst?.message as any}</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        SGST (%) <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(&lt; 100)</span>
                                    </label>
                                    <input
                                        {...register("sgst")}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="99.99"
                                        onWheel={disableScrollNumberInput}
                                        placeholder="e.g. 9.00"
                                        className="w-full py-2 px-3 rounded-lg bg-white border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-[#007FFF] transition text-sm"
                                    />
                                    <p className="text-xs text-red-500 mt-1">{errors.sgst?.message as any}</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        IGST (%) <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(&lt; 100)</span>
                                    </label>
                                    <input
                                        {...register("igst")}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="99.99"
                                        onWheel={disableScrollNumberInput}
                                        placeholder="e.g. 18.00"
                                        className="w-full py-2 px-3 rounded-lg bg-white border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-[#007FFF] transition text-sm"
                                    />
                                    <p className="text-xs text-red-500 mt-1">{errors.igst?.message as any}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div>
                        <label className="block text-base font-semibold text-black mb-2">Product Detail</label>
                        <div className="flex flex-col gap-3">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="flex flex-col sm:flex-row gap-2 rounded-xl bg-white items-start"
                                >
                                    <span className="flex-1 w-full">
                                        <input
                                            {...register(`detailJson.${index}.key` as const)}
                                            placeholder="Key"
                                            className="w-full px-3 py-2 rounded bg-white text-black border border-gray-300 focus:border-[#007FFF] focus:ring-2 focus:ring-blue-100 transition"
                                        />
                                        <p className="text-sm text-red-500 mt-1">
                                            {Array.isArray(errors.detailJson) && errors.detailJson[index]?.key?.message}
                                        </p>
                                    </span>
                                    <span className="flex-1 w-full">
                                        <input
                                            {...register(`detailJson.${index}.value` as const)}
                                            placeholder="Value"
                                            className="w-full px-3 py-2 rounded bg-white text-black border border-gray-300 focus:border-[#007FFF] focus:ring-2 focus:ring-blue-100 transition mt-2 sm:mt-0"
                                        />
                                        <p className="text-sm text-red-500 mt-1">
                                            {Array.isArray(errors.detailJson) ? errors.detailJson[index]?.value?.message : undefined}
                                        </p>
                                    </span>
                                    <div className="w-full sm:w-auto flex-shrink-0 mt-2 sm:mt-0">
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition w-full sm:w-auto"
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => append({ key: "", value: "" })}
                            className="flex items-center gap-2 px-4 py-2 mt-2 bg-gradient-to-r from-[#007FFF] to-[#0055CC] hover:from-[#0066CC] hover:to-[#0044BB] rounded-xl shadow-md text-white font-semibold hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                            + Add detail
                        </button>
                    </div>
                    {/* Product Features */}
                    <div>
                        <label className="block text-base font-semibold text-black mb-2">
                            Product Features
                        </label>
                        <div className="flex flex-col gap-3">
                            {featureFields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="flex flex-col sm:flex-row gap-2 rounded-xl bg-white items-start"
                                >
                                    <span className="flex-1 w-full">
                                        <input
                                            {...register(`featureJson.${index}.value` as const)}
                                            placeholder={`Feature ${index + 1}`}
                                            className="w-full px-3 py-2 rounded bg-white text-black border border-gray-300 focus:border-[#007FFF] focus:ring-2 focus:ring-blue-100 transition"
                                        />
                                        {/* ✅ Error message */}
                                        <p className="text-sm text-red-500 mt-1">
                                            {Array.isArray(errors.featureJson) ? errors.featureJson[index]?.value?.message : undefined}
                                        </p>
                                    </span>
                                    <div className="w-full sm:w-auto flex-shrink-0 mt-2 sm:mt-0">
                                        <button
                                            type="button"
                                            onClick={() => featureRemove(index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition w-full sm:w-auto"
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => featureAppend({ value: "" })}
                            className="flex items-center gap-2 px-4 py-2 mt-2 bg-gradient-to-r from-[#007FFF] to-[#0055CC] hover:from-[#0066CC] hover:to-[#0044BB] rounded-xl shadow-md text-white font-semibold hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                            + Add Feature
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Primary Image with Cropper */}
                        <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                            <label className="block text-base font-semibold text-black mb-1">Primary Image<span className="text-red-600">*</span></label>
                            <ImageCropperModal
                                onSelect={(img: any) => {
                                    setValue("image_url", img);
                                    setPreview(img);
                                }}
                                buttonLabel="Select Primary Image"
                            />
                            {preview && (
                                <img src={`${uploadUrl}${preview}`} alt="Primary" className="mt-4 h-24 w-24 rounded object-cover border" />
                            )}
                            <p className="text-sm text-red-500">{errors.image_url?.message as any}</p>
                        </div>
                        {/* Multiple Images with Cropper */}
                        <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                            <label className="block text-base font-semibold text-black mb-1">Additional Images</label>
                            <ImageCropperModal
                                multiple
                                onSelect={(imgs: any) => {
                                    const normalized = Array.isArray(imgs) ? imgs : imgs ? [imgs] : [];
                                    setValue("imageJson", normalized);
                                    setMultiPreview(normalized);
                                }}
                                buttonLabel="Select Additional Images"
                            />

                            <div className="flex gap-2 mt-4 flex-nowrap overflow-x-auto">
                                {Array.isArray(multiPreview) &&
                                    multiPreview.map((src, i) => (
                                        <img
                                            key={i}
                                            src={`${uploadUrl}${src}`}
                                            alt={`Preview ${i}`}
                                            className="h-20 w-20 rounded object-cover border"
                                        />
                                    ))}
                            </div>
                        </div>
                    </div>
                    {/* Status Toggle */}
                    <div
                        className="flex items-center gap-3 cursor-pointer select-none"
                        onClick={() => setValue("status", !watch("status"))}
                    >
                        <span className="block text-base font-semibold text-black">
                            Status
                        </span>
                        <div
                            className={`flex items-center h-6 w-12 rounded-full transition-all duration-300 ${watch("status") ? "bg-green-500" : "bg-red-500"
                                }`}
                        >
                            <span
                                className={`h-6 w-6 rounded-full bg-white shadow-md transform transition-all duration-300 ${watch("status") ? "translate-x-6" : "translate-x-0"
                                    }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit - full width */}
                <div className="border border-gray-300 rounded-xl mt-6 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] ">
                    <div className="max-w-[90rem] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">

                        {/* Message */}
                        <p className="text-sm text-gray-600 font-medium">
                            ⚠️ Please check all product details before submitting.
                        </p>

                        {/* Save Button */}
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#007FFF] to-[#0055CC] hover:from-[#0066CC] hover:to-[#0044BB] rounded-xl shadow-md text-white font-semibold hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                            {productId ? "Update Product" : "Save Product"}
                        </button>

                    </div>
                </div>
            </form>
        </div>
    );
}

export default ProductForm;
