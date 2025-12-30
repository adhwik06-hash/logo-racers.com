import { db } from "./db";
import {
  carBrands,
  scores,
  type CarBrand,
  type InsertCarBrand,
  type Score,
  type InsertScore,
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getBrands(difficulty?: string, limit?: number): Promise<CarBrand[]>;
  createBrand(brand: InsertCarBrand): Promise<CarBrand>;
  getScores(): Promise<Score[]>;
  createScore(score: InsertScore): Promise<Score>;
  seedBrands(brands: InsertCarBrand[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getBrands(difficulty?: string, limit: number = 10): Promise<CarBrand[]> {
    let query = db.select().from(carBrands);
    if (difficulty) {
      query.where(eq(carBrands.difficulty, difficulty));
    }
    // Randomize order and limit
    return await query.orderBy(sql`RANDOM()`).limit(limit);
  }

  async createBrand(brand: InsertCarBrand): Promise<CarBrand> {
    const [newBrand] = await db.insert(carBrands).values(brand).returning();
    return newBrand;
  }

  async getScores(): Promise<Score[]> {
    return await db.select().from(scores).orderBy(sql`${scores.score} DESC`).limit(10);
  }

  async createScore(score: InsertScore): Promise<Score> {
    const [newScore] = await db.insert(scores).values(score).returning();
    return newScore;
  }

  async seedBrands(brands: InsertCarBrand[]): Promise<void> {
    if (brands.length === 0) return;
    // Simple batch insert - in production might want to chunk this
    await db.insert(carBrands).values(brands).onConflictDoNothing();
  }
}

export const storage = new DatabaseStorage();
