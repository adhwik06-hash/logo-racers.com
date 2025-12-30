import { pgTable, text, serial, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const carBrands = pgTable("car_brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  imageUrl: text("image_url").notNull(),
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard', 'impossible'
  hasText: boolean("has_text").default(false), // To trigger specific blurring if needed
});

export const insertCarBrandSchema = createInsertSchema(carBrands).omit({ id: true });

export type CarBrand = typeof carBrands.$inferSelect;
export type InsertCarBrand = z.infer<typeof insertCarBrandSchema>;

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  score: integer("score").notNull(),
  difficulty: text("difficulty").notNull(),
});

export const insertScoreSchema = createInsertSchema(scores).omit({ id: true });
export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
