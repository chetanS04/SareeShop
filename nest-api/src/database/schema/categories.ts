import { relations } from 'drizzle-orm';
import {
  mysqlTable,
  bigint,
  varchar,
  text,
  boolean,
  timestamp,
  primaryKey,
} from 'drizzle-orm/mysql-core';
import { attributes } from './attributes';
import { products } from './products';

export const categories = mysqlTable('categories', {
  id: bigint('id', { mode: 'number', unsigned: true }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  image: varchar('image', { length: 255 }),
  secondaryImage: varchar('secondary_image', { length: 255 }),
  link: text('link'),
  status: boolean('status').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// Pivot: category <-> attributes (category attribute configuration)
export const categoryAttributes = mysqlTable(
  'category_attributes',
  {
    categoryId: bigint('category_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    attributeId: bigint('attribute_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => attributes.id, { onDelete: 'cascade' }),
    hasImages: boolean('has_images').default(false).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.categoryId, t.attributeId] }),
  }),
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  categoryAttributes: many(categoryAttributes),
}));

export const categoryAttributesRelations = relations(categoryAttributes, ({ one }) => ({
  category: one(categories, {
    fields: [categoryAttributes.categoryId],
    references: [categories.id],
  }),
  attribute: one(attributes, {
    fields: [categoryAttributes.attributeId],
    references: [attributes.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type CategoryAttribute = typeof categoryAttributes.$inferSelect;
