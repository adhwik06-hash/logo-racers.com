import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertCarBrandSchema, insertScoreSchema } from "@shared/schema";

// Seed data function
async function seedDatabase() {
  const existingBrands = await storage.getBrands(undefined, 1);
  if (existingBrands.length > 0) return;

  console.log("Seeding car brands...");
  
  // We will fetch the dataset from the public repo
  try {
    let data;
    try {
      const response = await fetch("https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/data.json");
      if (!response.ok) throw new Error("Failed to fetch car logos");
      data = await response.json();
    } catch (e) {
      console.warn("Using fallback data");
      data = [
        { name: "Toyota", slug: "toyota" },
        { name: "Honda", slug: "honda" },
        { name: "Ford", slug: "ford" },
        { name: "Chevrolet", slug: "chevrolet" },
        { name: "BMW", slug: "bmw" },
        { name: "Mercedes-Benz", slug: "mercedes-benz" },
        { name: "Audi", slug: "audi" },
        { name: "Ferrari", slug: "ferrari" },
        { name: "Lamborghini", slug: "lamborghini" },
        { name: "Porsche", slug: "porsche" }
      ];
    }
    
    const brandsToInsert: any[] = [];
    
    // Filter and map data
    // The user wants 150 non-EV, hypercar/luxury/normal.
    // The dataset has ~380. We'll filter out known EV brands if possible or just pick popular ones.
    
    const evBrands = ["tesla", "rivian", "lucid", "nio", "xpeng", "byd", "rimac", "polestar"];
    
    // Simple difficulty heuristic based on popularity (this is subjective but works for a game)
    const easyBrands = ["toyota", "honda", "ford", "chevrolet", "bmw", "mercedes-benz", "audi", "volkswagen", "nissan", "hyundai", "kia", "mazda", "subaru", "jeep", "ferrari", "lamborghini", "porsche"];
    const mediumBrands = ["volvo", "lexus", "acura", "infiniti", "cadillac", "lincoln", "buick", "jaguar", "land-rover", "mini", "mitsubishi", "peugeot", "renault", "fiat", "alfa-romeo", "maserati", "aston-martin", "bentley", "rolls-royce", "mclaren", "bugatti"];
    
    // Shuffle the data
    const shuffled = data.sort(() => 0.5 - Math.random());
    
    let count = 0;
    for (const item of shuffled) {
      if (count >= 150) break;
      
      const slug = item.slug.toLowerCase();
      if (evBrands.includes(slug)) continue;
      
      let difficulty = 'hard'; // Default
      if (easyBrands.includes(slug)) difficulty = 'easy';
      else if (mediumBrands.includes(slug)) difficulty = 'medium';
      else if (Math.random() > 0.8) difficulty = 'impossible'; // Randomly assign impossible to obscure ones
      
      // Use the optimized image URL from the repo
      const imageUrl = `https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/${item.slug}.png`;
      
      brandsToInsert.push({
        name: item.name,
        slug: item.slug,
        imageUrl: imageUrl,
        difficulty: difficulty,
        hasText: true, // Assume most have text, we'll blur in game logic
      });
      count++;
    }
    
    await storage.seedBrands(brandsToInsert);
    console.log(`Seeded ${brandsToInsert.length} car brands.`);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Call seed on startup
  seedDatabase();

  app.get(api.brands.list.path, async (req, res) => {
    try {
      const difficulty = req.query.difficulty as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const brands = await storage.getBrands(difficulty, limit);
      res.json(brands);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.scores.list.path, async (req, res) => {
    const scores = await storage.getScores();
    res.json(scores);
  });

  app.post(api.scores.create.path, async (req, res) => {
    try {
      const input = insertScoreSchema.parse(req.body);
      const score = await storage.createScore(input);
      res.status(201).json(score);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  return httpServer;
}
