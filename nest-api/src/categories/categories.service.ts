import { Injectable, Inject, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { eq, and, isNull, like, sql, or, desc, inArray } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import type { DrizzleDB } from '../database/database.provider';
import { categories, categoryAttributes, products, attributes, attributeValues, variants } from '../database/schema';
import { matchesSlugOrId } from '../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // === CATEGORIES INDEX ===

  async index(query: any = {}): Promise<any> {
    const isPaginatedRequest = query.page !== undefined || query.limit !== undefined || query.per_page !== undefined || query.search !== undefined;
    const perPage = Math.max(1, parseInt(query.limit ?? query.per_page ?? '10'));
    const page = Math.max(1, parseInt(query.page ?? '1'));
    const search = (query.search || query.q || '').trim();
    const includeInactive = query?.include_inactive === 'true';
    const orderBy = (query?.order_by || query?.orderBy || '').toLowerCase();
    const orderDirection = (query?.order_direction || query?.orderDirection || 'desc').toLowerCase();

    const conditions: any[] = [];
    if (!includeInactive) {
      conditions.push(eq(categories.status, true));
    }

    if (search) {
      conditions.push(
        or(
          like(categories.name, `%${search}%`),
          like(categories.description, `%${search}%`),
        ),
      );
    }

    // 1. Fetch product counts grouped by category_id
    const productCountRows = await this.db
      .select({
        categoryId: products.categoryId,
        count: sql<number>`count(${products.id})`,
      })
      .from(products)
      .where(includeInactive ? sql`1=1` : eq(products.status, true))
      .groupBy(products.categoryId);

    const productCountMap = new Map<number, number>();
    for (const row of productCountRows) {
      if (row.categoryId != null) {
        productCountMap.set(Number(row.categoryId), Number(row.count) || 0);
      }
    }

    // 2. Fetch all matching categories
    const allMatching = await this.db
      .select()
      .from(categories)
      .where(conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : and(...conditions)) : undefined);

    // 3. Fetch attributes for all matching categories
    const matchingIds = allMatching.map((c: any) => Number(c.id));
    let catAttrs: any[] = [];
    if (matchingIds.length > 0) {
      catAttrs = await this.db
        .select({
          categoryId: categoryAttributes.categoryId,
          attributeId: categoryAttributes.attributeId,
          hasImages: categoryAttributes.hasImages,
          isPrimary: categoryAttributes.isPrimary,
          attribute: {
            id: attributes.id,
            name: attributes.name,
            description: attributes.description,
            status: attributes.status,
          },
        })
        .from(categoryAttributes)
        .leftJoin(attributes, eq(categoryAttributes.attributeId, attributes.id))
        .where(inArray(categoryAttributes.categoryId, matchingIds));
    }

    const catAttrMap = new Map<number, any[]>();
    for (const ca of catAttrs) {
      const cid = Number(ca.categoryId);
      if (!catAttrMap.has(cid)) catAttrMap.set(cid, []);
      catAttrMap.get(cid)!.push(ca);
    }

    // 4. Format categories with product counts and attributes
    const formatted = allMatching.map((cat: any) => {
      const directCount = productCountMap.get(Number(cat.id)) || 0;
      const cAttrs = catAttrMap.get(Number(cat.id)) || [];

      return {
        ...this.formatCategory({
          ...cat,
          categoryAttributes: cAttrs,
        }),
        products_count: directCount,
        productsCount: directCount,
        children: [],
      };
    });

    // 5. Sort categories
    const isSortByProducts =
      orderBy === 'products_count' ||
      orderBy === 'products' ||
      orderBy === 'most_products' ||
      (!orderBy && !includeInactive);

    if (isSortByProducts) {
      formatted.sort((a: any, b: any) => {
        const prodDiff = (b.products_count || 0) - (a.products_count || 0);
        if (prodDiff !== 0) return orderDirection === 'asc' ? -prodDiff : prodDiff;
        return Number(b.id) - Number(a.id);
      });
    } else if (orderBy === 'name') {
      formatted.sort((a: any, b: any) => {
        return orderDirection === 'desc'
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      });
    } else {
      // Default admin sort (created_at DESC)
      formatted.sort((a: any, b: any) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return orderDirection === 'asc' ? timeA - timeB : timeB - timeA;
      });
    }

    const total = formatted.length;
    const paginated = isPaginatedRequest
      ? formatted.slice((page - 1) * perPage, page * perPage)
      : formatted;

    const lastPage = Math.ceil(total / perPage) || 1;
    const hasNextPage = page < lastPage;

    if (!isPaginatedRequest && !query.paginate) {
      return paginated;
    }

    return {
      res: 'success',
      data: {
        categories: paginated,
        pagination: {
          current_page: page,
          page,
          per_page: perPage,
          limit: perPage,
          total,
          last_page: lastPage,
          has_next_page: hasNextPage,
          hasNextPage,
          has_more: hasNextPage,
        },
      },
      categories: paginated,
    };
  }

  async indexWithProducts(): Promise<any> {
    const productCountRows = await this.db
      .select({
        categoryId: products.categoryId,
        count: sql<number>`count(${products.id})`,
      })
      .from(products)
      .where(eq(products.status, true))
      .groupBy(products.categoryId);

    const productCountMap = new Map<number, number>();
    for (const row of productCountRows) {
      if (row.categoryId != null) {
        productCountMap.set(Number(row.categoryId), Number(row.count) || 0);
      }
    }

    const allCategories = await this.db
      .select()
      .from(categories)
      .where(eq(categories.status, true));

    const formatted = allCategories.map((cat: any) => {
      const count = productCountMap.get(Number(cat.id)) || 0;
      return {
        ...this.formatCategory(cat),
        products_count: count,
        productsCount: count,
        children: [],
      };
    });

    formatted.sort((a: any, b: any) => {
      const prodDiff = (b.products_count ?? 0) - (a.products_count ?? 0);
      if (prodDiff !== 0) return prodDiff;
      return Number(b.id) - Number(a.id);
    });

    return formatted;
  }

  // === SHOW CATEGORY ===

  async show(idOrSlug: string | number, query: any = {}): Promise<any> {
    const includeInactive = query?.include_inactive === 'true';

    let category: any = null;
    const numId = Number(idOrSlug);
    if (!isNaN(numId) && numId > 0 && String(idOrSlug).trim() === String(numId)) {
      const [found] = await this.db.select().from(categories).where(eq(categories.id, numId)).limit(1);
      category = found || null;
    }

    if (!category) {
      const slugLower = String(idOrSlug).toLowerCase().trim();
      const allCats: any[] = await this.db.select().from(categories);
      category = allCats.find((cat: any) => {
        const itemSlug = (cat.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return itemSlug === slugLower || (cat.name || '').toLowerCase().trim() === slugLower;
      });
    }

    if (!category) {
      throw new HttpException(
        { success: false, message: 'Category not found or inactive.' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!includeInactive && !category.status) {
      throw new HttpException(
        { success: false, message: 'Category not found or inactive.' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Load category attributes directly
    const catAttrs = await this.db
      .select({
        categoryId: categoryAttributes.categoryId,
        attributeId: categoryAttributes.attributeId,
        hasImages: categoryAttributes.hasImages,
        isPrimary: categoryAttributes.isPrimary,
        attribute: {
          id: attributes.id,
          name: attributes.name,
          description: attributes.description,
          status: attributes.status,
        },
      })
      .from(categoryAttributes)
      .leftJoin(attributes, eq(categoryAttributes.attributeId, attributes.id))
      .where(eq(categoryAttributes.categoryId, category.id));

    const slug = (category.name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const formattedCategory = {
      ...this.formatCategory({
        ...category,
        categoryAttributes: catAttrs,
      }),
      slug,
      children: [],
      attributes: catAttrs.map((ca: any) => ({
        id: ca.attribute?.id,
        name: ca.attribute?.name,
        description: ca.attribute?.description,
        status: ca.attribute?.status,
        is_primary: ca.isPrimary,
        has_images: ca.hasImages,
        pivot: {
          category_id: ca.categoryId,
          attribute_id: ca.attributeId,
          has_images: ca.hasImages,
          is_primary: ca.isPrimary,
        },
      })),
    };

    return {
      success: true,
      message: 'Category details fetched successfully.',
      result: formattedCategory,
    };
  }

  async getCategoryByIdForProduct(idOrSlug: string | number, query: any = {}): Promise<any> {
    const includeInactive = query?.include_inactive === 'true';

    let category: any = null;
    const numId = Number(idOrSlug);
    if (!isNaN(numId) && numId > 0 && String(idOrSlug).trim() === String(numId)) {
      const [row] = await this.db.select().from(categories).where(eq(categories.id, numId)).limit(1);
      category = row;
    }

    if (!category) {
      const slugLower = String(idOrSlug).toLowerCase().trim();
      const allCats: any[] = await this.db.select().from(categories);
      category = allCats.find((cat: any) => {
        const itemSlug = (cat.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return itemSlug === slugLower || (cat.name || '').toLowerCase().trim() === slugLower;
      });
    }

    if (!category) {
      throw new HttpException(
        { success: false, message: 'Category not found or inactive.' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!includeInactive && !category.status) {
      throw new HttpException(
        { success: false, message: 'Category not found or inactive.' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Direct fetch of categoryAttributes
    const catAttrs = await this.db
      .select({
        categoryId: categoryAttributes.categoryId,
        attributeId: categoryAttributes.attributeId,
        hasImages: categoryAttributes.hasImages,
        isPrimary: categoryAttributes.isPrimary,
        attribute: {
          id: attributes.id,
          name: attributes.name,
          description: attributes.description,
          status: attributes.status,
        },
      })
      .from(categoryAttributes)
      .innerJoin(attributes, eq(categoryAttributes.attributeId, attributes.id))
      .where(eq(categoryAttributes.categoryId, category.id));

    // Direct fetch of attributeValues
    const attrIds = catAttrs.map((ca: any) => ca.attributeId).filter(Boolean);
    let attrValRows: any[] = [];
    if (attrIds.length > 0) {
      attrValRows = await this.db
        .select()
        .from(attributeValues)
        .where(
          and(
            inArray(attributeValues.attributeId, attrIds),
            eq(attributeValues.status, true),
          ),
        );
    }

    const attrValMap = new Map<number, any[]>();
    for (const v of attrValRows) {
      const aid = Number(v.attributeId);
      if (!attrValMap.has(aid)) attrValMap.set(aid, []);
      attrValMap.get(aid)!.push(v);
    }

    const attributesList = (catAttrs ?? [])
      .sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
      .map((ca: any) => ({
        ...ca.attribute,
        is_primary: ca.isPrimary,
        has_images: ca.hasImages,
        values: (attrValMap.get(Number(ca.attributeId)) || []).map((v: any) => ({
          id: v.id,
          value: v.value,
          color_code: v.colorCode,
          status: v.status,
        })),
      }));

    const slug = (category.name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const formattedCategory = {
      ...this.formatCategory({
        ...category,
        categoryAttributes: catAttrs,
      }),
      slug,
      children: [],
      attributes: attributesList,
    };

    return {
      success: true,
      message: 'Category details fetched successfully.',
      result: formattedCategory,
    };
  }

  // === CREATE & UPDATE CATEGORY WITH ATTRIBUTES ===

  async store(body: any) {
    if (!body?.name) {
      throw new HttpException(
        { res: 'error', message: 'The name field is required.' },
        HttpStatus.UNPROCESSABLE_ENTITY, // 422
      );
    }

    const nameLower = body.name.toLowerCase().trim();
    const existing = await this.db.query.categories.findFirst({
      where: sql`LOWER(${categories.name}) = ${nameLower}`,
    });

    if (existing) {
      throw new HttpException(
        { res: 'error', message: 'This category already exists.' },
        HttpStatus.UNPROCESSABLE_ENTITY, // 422
      );
    }

    let attrs = body.attributes;
    if (typeof attrs === 'string') {
      try {
        attrs = JSON.parse(attrs);
      } catch (e) {
        attrs = [];
      }
    }

    if (Array.isArray(attrs)) {
      attrs = attrs.map((attr: any) => ({
        AttributeId: attr.AttributeId ?? attr.attribute_id ?? attr.id ?? null,
        HasImages: Boolean(attr.HasImages ?? attr.has_images ?? false),
        IsPrimary: Boolean(attr.IsPrimary ?? attr.is_primary ?? attr.isPrimary ?? false),
      })).filter((a: any) => a.AttributeId != null);
    } else {
      attrs = [];
    }

    if (attrs.length > 2) {
      throw new HttpException(
        { res: 'error', message: 'You can only add up to 2 attributes to a category.' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (attrs.length > 0) {
      const primaryCount = attrs.filter((a: any) => a.IsPrimary).length;
      if (primaryCount > 1) {
        throw new HttpException(
          { res: 'error', message: 'Only one attribute can be marked as primary.' },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const hasImagesCount = attrs.filter((a: any) => a.HasImages).length;
      if (hasImagesCount > 1) {
        throw new HttpException(
          { res: 'error', message: 'Only one attribute can have Has Images enabled.' },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    const [result] = await this.db.insert(categories).values({
      name: body.name.trim(),
      description: body.description ?? null,
      image: body.image ?? null,
      secondaryImage: body.secondary_image ?? body.secondaryImage ?? null,
      link: body.link ?? null,
      status: body.status !== undefined ? Boolean(body.status) : true,
    }).$returningId();

    if (attrs.length > 0) {
      await this._syncCategoryAttributes(result.id, attrs);
    }

    const catWithAttrs = await this.findCategoryWithAttributes(result.id);

    return {
      res: 'success',
      category: this.formatCategory(catWithAttrs),
    };
  }

  async update(id: number, body: any) {
    const existingCat = await this.db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
    if (!existingCat) {
      throw new HttpException(
        { res: 'error', message: 'Category not found.' },
        HttpStatus.NOT_FOUND, // 404
      );
    }

    if (!body?.name) {
      throw new HttpException(
        { res: 'error', message: 'The name field is required.' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const nameLower = body.name.toLowerCase().trim();
    const duplicate = await this.db.query.categories.findFirst({
      where: and(
        sql`LOWER(${categories.name}) = ${nameLower}`,
        sql`${categories.id} != ${id}`,
      ),
    });

    if (duplicate) {
      throw new HttpException(
        { res: 'error', message: 'This category already exists.' },
        HttpStatus.UNPROCESSABLE_ENTITY, // 422
      );
    }

    await this.db.update(categories).set({
      name: body.name.trim(),
      description: body.description ?? null,
      image: body.image ?? null,
      secondaryImage: body.secondary_image ?? body.secondaryImage ?? null,
      link: body.link ?? null,
      status: body.status !== undefined ? Boolean(body.status) : existingCat.status,
    }).where(eq(categories.id, id));

    // Handle attributes update if provided
    if (body.attributes !== undefined) {
      let attrs = body.attributes;
      if (typeof attrs === 'string') {
        try {
          attrs = JSON.parse(attrs);
        } catch (e) {
          attrs = [];
        }
      }

      if (Array.isArray(attrs)) {
        attrs = attrs.map((attr: any) => ({
          AttributeId: attr.AttributeId ?? attr.attribute_id ?? attr.id ?? null,
          HasImages: Boolean(attr.HasImages ?? attr.has_images ?? false),
          IsPrimary: Boolean(attr.IsPrimary ?? attr.is_primary ?? attr.isPrimary ?? false),
        })).filter((a: any) => a.AttributeId != null);
      } else {
        attrs = [];
      }

      if (attrs.length > 2) {
        throw new HttpException(
          { res: 'error', message: 'You can only add up to 2 attributes to a category.' },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (attrs.length > 0) {
        const primaryCount = attrs.filter((a: any) => a.IsPrimary).length;
        if (primaryCount > 1) {
          throw new HttpException(
            { res: 'error', message: 'Only one attribute can be marked as primary.' },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }

        const hasImagesCount = attrs.filter((a: any) => a.HasImages).length;
        if (hasImagesCount > 1) {
          throw new HttpException(
            { res: 'error', message: 'Only one attribute can have Has Images enabled.' },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }

      // Sync category attributes
      await this.db.delete(categoryAttributes).where(eq(categoryAttributes.categoryId, id));
      if (attrs.length > 0) {
        await this._syncCategoryAttributes(id, attrs);
      }
    }

    const updatedCatWithAttrs = await this.findCategoryWithAttributes(id);

    return {
      res: 'success',
      category: this.formatCategory(updatedCatWithAttrs),
    };
  }

  async destroy(id: number) {
    const category = await this.db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
    if (!category) {
      throw new HttpException(
        { res: 'error', message: 'Category not found.' },
        HttpStatus.NOT_FOUND,
      );
    }

    const hasProducts = await this.db.query.products.findFirst({
      where: eq(products.categoryId, id),
    });
    if (hasProducts) {
      throw new HttpException(
        {
          res: 'error',
          message: 'This category cannot be deleted because it is associated with existing products.',
        },
        HttpStatus.BAD_REQUEST, // 400
      );
    }

    await this.db.delete(categoryAttributes).where(eq(categoryAttributes.categoryId, id));
    await this.db.delete(categories).where(eq(categories.id, id));

    return {
      res: 'success',
      message: 'Category deleted successfully',
    };
  }

  async changeStatus(id: number) {
    const category = await this.db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
    if (!category) {
      throw new HttpException(
        { res: 'error', message: 'Category not found.' },
        HttpStatus.NOT_FOUND,
      );
    }

    const newStatus = !category.status;
    await this.db.update(categories).set({ status: newStatus }).where(eq(categories.id, id));

    return {
      result: 'success',
      message: 'Status updated successfully',
      status: newStatus,
    };
  }

  // === COMPATIBILITY METHODS (Redirecting legacy subcategory calls smoothly) ===

  async subcategoriesWithProducts(query: any = {}): Promise<any> {
    const all = await this.indexWithProducts();
    return {
      res: 'success',
      parent_category: null,
      subcategories: all,
      total: all.length,
    };
  }

  async getSubcategoriesWithProductCounts(query: any = {}): Promise<any> {
    return this.index({ ...query, include_inactive: query.include_inactive });
  }

  async subcategoryIndex(query: any = {}): Promise<any> {
    return this.index(query);
  }

  async subcategoryShow(idOrSlug: string | number, query: any = {}): Promise<any> {
    const res = await this.show(idOrSlug, query);
    return {
      res: 'success',
      subcategory: res.result,
      category: res.result,
    };
  }

  async storeSubcategory(body: any) {
    return this.store(body);
  }

  async updateSubcategory(id: number, body: any) {
    return this.update(id, body);
  }

  async destroySubcategory(id: number) {
    return this.destroy(id);
  }

  // === PRIVATE HELPERS ===

  private async findCategoryWithAttributes(id: number) {
    const [cat] = await this.db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (!cat) return null;

    const catAttrs = await this.db
      .select({
        categoryId: categoryAttributes.categoryId,
        attributeId: categoryAttributes.attributeId,
        hasImages: categoryAttributes.hasImages,
        isPrimary: categoryAttributes.isPrimary,
        attribute: {
          id: attributes.id,
          name: attributes.name,
          description: attributes.description,
          status: attributes.status,
        },
      })
      .from(categoryAttributes)
      .leftJoin(attributes, eq(categoryAttributes.attributeId, attributes.id))
      .where(eq(categoryAttributes.categoryId, id));

    return {
      ...cat,
      categoryAttributes: catAttrs,
    };
  }

  private formatCategory(cat: any) {
    if (!cat) return null;

    let formattedAttrs: any[] | undefined = undefined;
    if (cat.categoryAttributes && Array.isArray(cat.categoryAttributes)) {
      formattedAttrs = cat.categoryAttributes.map((ca: any) => ({
        id: Number(ca.attribute?.id ?? ca.attributeId),
        name: ca.attribute?.name,
        ...(ca.attribute?.description !== undefined ? { description: ca.attribute.description } : {}),
        ...(ca.attribute?.status !== undefined ? { status: Boolean(ca.attribute.status) } : {}),
        is_primary: Boolean(ca.isPrimary),
        has_images: Boolean(ca.hasImages),
        pivot: {
          category_id: Number(ca.categoryId),
          attribute_id: Number(ca.attributeId),
          has_images: Boolean(ca.hasImages),
          is_primary: Boolean(ca.isPrimary),
        },
      }));
    } else if (cat.attributes && Array.isArray(cat.attributes)) {
      formattedAttrs = cat.attributes;
    }

    const slug = (cat.slug || cat.name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return {
      id: Number(cat.id),
      name: cat.name,
      slug,
      description: cat.description ?? null,
      image: cat.image ?? null,
      secondary_image: cat.secondaryImage ?? cat.secondary_image ?? null,
      secondaryImage: cat.secondaryImage ?? cat.secondary_image ?? null,
      link: cat.link ?? null,
      status: Boolean(cat.status),
      created_at: cat.createdAt ?? cat.created_at,
      updated_at: cat.updatedAt ?? cat.updated_at,
      ...(cat.products_count !== undefined ? { products_count: cat.products_count, productsCount: cat.products_count } : {}),
      ...(formattedAttrs !== undefined ? { attributes: formattedAttrs } : {}),
      children: [],
    };
  }

  private async _syncCategoryAttributes(categoryId: number, attrs: any[]) {
    for (const attr of attrs) {
      const attributeId = attr.AttributeId ?? attr.attribute_id ?? attr.id;
      if (!attributeId) continue;
      await this.db.insert(categoryAttributes).values({
        categoryId,
        attributeId: Number(attributeId),
        hasImages: Boolean(attr.HasImages ?? attr.has_images ?? false),
        isPrimary: Boolean(attr.IsPrimary ?? attr.is_primary ?? false),
      });
    }
  }
}
