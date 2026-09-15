import axios from "./axios";
import { getImageUrl } from "./imageUtils";
import { getCategorySlug } from "./slugUtils";
import type { ArchetypeConfig } from "@/data/archetypes";
import { ARCHETYPES } from "@/data/archetypes";

export type CatalogCategory = {
  id: number;
  name: string;
  description?: string;
  image?: string | null;
  secondary_image?: string | null;
  parentId?: number | null;
  parent_id?: number | null;
  [key: string]: any;
};

export function normalizeList(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.sliders)) return payload.sliders;
  return [];
}

export function productImageUrl(product: any): string | null {
  if (!product) return null;
  const raw =
    product.image_url ||
    product.image ||
    product.thumbnail ||
    (Array.isArray(product.image_json) ? product.image_json[0] : null) ||
    product.best_variant?.image_url ||
    product.best_variant?.image ||
    null;
  return getImageUrl(raw);
}

export function categoryImageUrl(category: CatalogCategory | null | undefined): string | null {
  if (!category) return null;
  return (
    getImageUrl(category.image) ||
    getImageUrl(category.secondary_image) ||
    null
  );
}

/** Match archetype categoryNames to live catalog categories (exact first, then soft). */
export function resolveArchetypeCategories(
  categoryNames: string[],
  categories: CatalogCategory[]
): CatalogCategory[] {
  const parents = categories.filter((c) => !(c.parentId ?? c.parent_id));
  const pool = parents.length ? parents : categories;
  const lowered = categoryNames.map((n) => n.toLowerCase());

  const exact = pool.filter((c) =>
    lowered.includes(String(c.name || "").toLowerCase())
  );
  if (exact.length) return exact;

  return pool.filter((c) => {
    const cn = String(c.name || "").toLowerCase();
    return lowered.some((n) => {
      const key = n.replace(/^the\s+/, "").trim();
      if (key.length < 3) return false;
      // Avoid soft-matching short brand words against unrelated names
      if (["leader", "mentor", "creator", "home manager", "home"].includes(key)) {
        return cn === key || cn.includes(`the ${key}`);
      }
      return cn.includes(key) || key.includes(cn);
    });
  });
}

export function resolveArchetypeMedia(
  archetype: ArchetypeConfig,
  categories: CatalogCategory[],
  products: any[] = []
): { categoryIds: number[]; imageUrl: string | null; matched: CatalogCategory[] } {
  const matched = resolveArchetypeCategories(archetype.categoryNames, categories);
  const categoryIds = matched.map((c) => Number(c.id)).filter(Boolean);

  let imageUrl: string | null = null;
  for (const c of matched) {
    imageUrl = categoryImageUrl(c);
    if (imageUrl) break;
  }
  if (!imageUrl) {
    for (const p of products) {
      imageUrl = productImageUrl(p);
      if (imageUrl) break;
    }
  }

  return { categoryIds, imageUrl, matched };
}

export async function fetchCategories(): Promise<CatalogCategory[]> {
  try {
    const res = await axios.get("/api/categories-with-products");
    const list = normalizeList(res.data);
    if (list.length) return list as CatalogCategory[];
  } catch {
    /* fall through */
  }
  try {
    const res = await axios.get("/api/categories");
    return normalizeList(res.data) as CatalogCategory[];
  } catch {
    return [];
  }
}

export async function fetchProductsList(params?: {
  per_page?: number;
  page?: number;
  category_id?: number;
  search?: string;
}): Promise<any[]> {
  const per_page = params?.per_page ?? 48;
  const page = params?.page ?? 1;
  const query: Record<string, string | number> = { per_page, page };
  if (params?.category_id) query.category_id = params.category_id;
  if (params?.search) query.search = params.search;

  try {
    const res = await axios.get("/api/products-paginated", { params: query });
    const list = normalizeList(res.data);
    if (list.length) return list;
  } catch {
    /* fall through */
  }

  try {
    const res = await axios.get("/api/products");
    let list = normalizeList(res.data);
    if (params?.category_id) {
      list = list.filter(
        (p) => Number(p.category_id ?? p.category?.id ?? 0) === Number(params.category_id)
      );
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((p) =>
        String(p.name || "")
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  } catch {
    return [];
  }
}

/** Products for an archetype — only from matched categories. Empty if none. */
export async function fetchArchetypeProducts(
  archetype: ArchetypeConfig,
  categories?: CatalogCategory[]
): Promise<{ products: any[]; matched: CatalogCategory[]; imageUrl: string | null }> {
  const cats = categories ?? (await fetchCategories());
  const matched = resolveArchetypeCategories(archetype.categoryNames, cats);
  const ids = matched.map((c) => Number(c.id)).filter(Boolean);

  if (!ids.length) {
    return { products: [], matched, imageUrl: null };
  }

  // Fetch per category and merge (API supports single category_id)
  const buckets = await Promise.all(
    ids.slice(0, 8).map((id) => fetchProductsList({ per_page: 24, page: 1, category_id: id }))
  );

  const seen = new Set<number>();
  const products: any[] = [];
  for (const bucket of buckets) {
    for (const p of bucket) {
      const pid = Number(p.id);
      if (!pid || seen.has(pid)) continue;
      seen.add(pid);
      products.push(p);
    }
  }

  // Also filter a broader list in case paginated misses nested category shape
  if (products.length === 0) {
    const all = await fetchProductsList({ per_page: 48, page: 1 });
    const idSet = new Set(ids);
    for (const p of all) {
      const cid = Number(p.category_id ?? p.category?.id ?? 0);
      if (idSet.has(cid) && !seen.has(Number(p.id))) {
        seen.add(Number(p.id));
        products.push(p);
      }
    }
  }

  const { imageUrl } = resolveArchetypeMedia(archetype, cats, products);
  return { products, matched, imageUrl };
}

export async function fetchActiveSliderImage(): Promise<string | null> {
  try {
    const res = await axios.get("/api/sliders", {
      params: { status: true, per_page: 10 },
    });
    const list = normalizeList(res.data);
    for (const s of list) {
      if (s.status === false || s.status === 0) continue;
      const url = getImageUrl(s.image || s.image_url);
      if (url) return url;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function loadArchetypeCardsMedia(): Promise<
  Record<string, { imageUrl: string | null; productCount: number; categoryName?: string }>
> {
  const categories = await fetchCategories();
  const result: Record<
    string,
    { imageUrl: string | null; productCount: number; categoryName?: string }
  > = {};

  await Promise.all(
    ARCHETYPES.map(async (a) => {
      const { products, imageUrl, matched } = await fetchArchetypeProducts(a, categories);
      result[a.slug] = {
        imageUrl,
        productCount: products.length,
        categoryName: matched[0]?.name,
      };
    })
  );

  return result;
}

export type ShopFacetCard = {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  productCount: number;
  href: string;
};

/** Parent categories for Shop Who You Are — live names, images, counts from API. */
export async function loadShopWhoYouAreFacets(limit = 8): Promise<ShopFacetCard[]> {
  const categories = await fetchCategories();
  const parents = categories.filter((c) => !(c.parentId ?? c.parent_id));
  const pool = (parents.length ? parents : categories)
    .filter((c) => Number(c.products_count ?? c.productsCount ?? 0) > 0 || true)
    .sort(
      (a, b) =>
        Number(b.products_count ?? b.productsCount ?? 0) -
        Number(a.products_count ?? a.productsCount ?? 0)
    );

  const cards: ShopFacetCard[] = [];

  for (const cat of pool.slice(0, Math.max(limit, 12))) {
    const count = Number(cat.products_count ?? cat.productsCount ?? 0);
    let imageUrl = categoryImageUrl(cat);

    if (!imageUrl) {
      const products = await fetchProductsList({
        per_page: 1,
        page: 1,
        category_id: Number(cat.id),
      });
      imageUrl = productImageUrl(products[0]);
    }

    // Prefer facets that have media or products
    if (!imageUrl && count === 0) continue;

    cards.push({
      id: Number(cat.id),
      name: String(cat.name || "Collection"),
      description: String(cat.description || "").replace(/<[^>]+>/g, "").trim(),
      imageUrl,
      productCount: count,
      href: `/categories/subcategories/${getCategorySlug(cat)}`,
    });

    if (cards.length >= limit) break;
  }

  // If nothing had products_count but categories exist, still show top parents with product lookup
  if (cards.length === 0) {
    for (const cat of pool.slice(0, limit)) {
      const products = await fetchProductsList({
        per_page: 4,
        page: 1,
        category_id: Number(cat.id),
      });
      cards.push({
        id: Number(cat.id),
        name: String(cat.name || "Collection"),
        description: String(cat.description || "").replace(/<[^>]+>/g, "").trim(),
        imageUrl: categoryImageUrl(cat) || productImageUrl(products[0]),
        productCount: products.length,
        href: `/categories/subcategories/${getCategorySlug(cat)}`,
      });
    }
  }

  return cards;
}
