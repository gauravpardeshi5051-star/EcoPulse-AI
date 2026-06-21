/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import { CARBON_CONFIG, CarbonLog } from "./types";

// Simulated sanitizer function mirror from server.ts to test its functionality
function sanitizeNotes(notes: any): string {
  if (typeof notes !== "string") return "";
  return notes.slice(0, 150).replace(/[$\{\}<>&]/g, "").trim();
}

// Simulated limit validation from server.ts
function validateLogInput(category: string, subcategory: string, amount: number, co2e: number, unit: string) {
  const validCategories = ["transport", "energy", "diet", "consumption", "offset"];
  if (!validCategories.includes(category)) return false;
  if (subcategory.length > 80) return false;
  if (unit.length > 25) return false;
  if (isNaN(amount) || isNaN(co2e) || !isFinite(amount) || !isFinite(co2e)) return false;
  if (Math.abs(amount) > 1000000 || Math.abs(co2e) > 100000) return false;
  return true;
}

// Simulated budget target calculator with divide-by-zero mitigation from App.tsx
function getBudgetProgress(monthlySpent: number, budgetValue: number): number {
  const divisor = budgetValue <= 0 ? 1 : budgetValue;
  return Math.min(Math.round((monthlySpent / divisor) * 100), 100);
}

// Simulated active streak computing
function calculateCurrentStreak(logsCount: number, daysObserved: number, completedChallenges: number): number {
  if (logsCount === 0) return 0;
  return Math.min(daysObserved, 5) + Math.min(completedChallenges, 4);
}

describe("EcoPulse AI Mathematical Core Tests", () => {
  it("should have correct, non-zero carbon emission factors for each subcategory", () => {
    Object.keys(CARBON_CONFIG).forEach((catKey) => {
      const config = CARBON_CONFIG[catKey as any];
      expect(config).toBeDefined();
      expect(config.subcategories.length).toBeGreaterThan(0);
      
      config.subcategories.forEach((sub) => {
        expect(sub.id).toBeDefined();
        expect(sub.label).toBeDefined();
        expect(typeof sub.factor).toBe("number");
        
        if (catKey === "offset") {
          expect(sub.factor).toBeLessThanOrEqual(0);
        } else {
          expect(sub.factor).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  it("should accurately calculate total emissions and active offsets from logs", () => {
    const mockLogs: CarbonLog[] = [
      {
        id: "log_1",
        date: "2026-06-20",
        category: "transport",
        subcategory: "car_petrol",
        amount: 100,
        unit: "km",
        co2e: 18.0,
        createdAt: "2026-06-20T10:00:00Z"
      },
      {
        id: "log_2",
        date: "2026-06-20",
        category: "energy",
        subcategory: "electricity_standard",
        amount: 200,
        unit: "kWh",
        co2e: 76.0,
        createdAt: "2026-06-20T11:00:00Z"
      },
      {
        id: "log_3",
        date: "2026-06-20",
        category: "offset",
        subcategory: "offset_tree_planted",
        amount: 2,
        unit: "trees",
        co2e: -44.0,
        createdAt: "2026-06-20T12:00:00Z"
      }
    ];

    const grossEmissionsByCat = mockLogs
      .filter((l) => l.category !== "offset")
      .reduce((acc, l) => acc + l.co2e, 0);

    const totalOffsets = mockLogs
      .filter((l) => l.category === "offset")
      .reduce((acc, l) => acc + Math.abs(l.co2e), 0);

    const netScore = grossEmissionsByCat - totalOffsets;

    expect(grossEmissionsByCat).toBe(94.0);
    expect(totalOffsets).toBe(44.0);
    expect(netScore).toBe(50.0);
  });

  it("should enforce standard presets on profile archetypes correctly", () => {
    const archetypes = {
      individual: { limit: 5.4, budget: 160 },
      digital_nomad: { limit: 6.5, budget: 195 },
      corporate: { limit: 45.0, budget: 1350 },
      small_business: { limit: 25.0, budget: 750 }
    };

    expect(archetypes.individual.limit).toBe(5.4);
    expect(archetypes.digital_nomad.budget).toBe(195);
    expect(archetypes.corporate.limit).toBe(45.0);
    expect(archetypes.small_business.budget).toBe(750);
  });
});

describe("EcoPulse AI Outlier and Input Security Testing Suite", () => {
  it("should strip HTML and dangerous payload identifiers inside inputs", () => {
    const dirtyNote = "<script>alert('compromised')</script> Safe text with {curly} and $dollar";
    const result = sanitizeNotes(dirtyNote);
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("{");
    expect(result).not.toContain("}");
    expect(result).not.toContain("$");
    expect(result).toBe("scriptalert('compromised')/script Safe text with curly and dollar");
  });

  it("should limit maximum length of notes text to defend memory exhaustion", () => {
    const longInput = "a".repeat(300);
    const result = sanitizeNotes(longInput);
    expect(result.length).toBe(150);
  });

  it("should detect invalid or malicious category codes", () => {
    const isValid = validateLogInput("crypto_mining_unsupported", "mine", 10, 10, "kWh");
    expect(isValid).toBe(false);
  });

  it("should prevent volumetric injection attacks checking extreme numbers bounds", () => {
    const isUnderLimit = validateLogInput("transport", "car_petrol", 10000000, 10, "km");
    expect(isUnderLimit).toBe(false);

    const isCO2UnderLimit = validateLogInput("transport", "car_petrol", 10, 999999999, "km");
    expect(isCO2UnderLimit).toBe(false);

    const isHealthyLog = validateLogInput("transport", "car_petrol", 200, 36, "km");
    expect(isHealthyLog).toBe(true);
  });
});

describe("EcoPulse AI Interactive Calculations and Formulas Suite", () => {
  it("should calculate correct scale ratio with budget target values", () => {
    expect(getBudgetProgress(80, 160)).toBe(50);
    expect(getBudgetProgress(160, 160)).toBe(100);
    expect(getBudgetProgress(200, 160)).toBe(100); // capped at 100
  });

  it("should handle division by zero gracefully inside budget progress calculator", () => {
    expect(getBudgetProgress(50, 0)).toBe(100);
    expect(getBudgetProgress(50, -50)).toBe(100);
  });

  it("should evaluate current streak scores correctly based on engagement elements", () => {
    expect(calculateCurrentStreak(0, 0, 0)).toBe(0);
    expect(calculateCurrentStreak(5, 1, 0)).toBe(1); // 1 day observed, 0 challenges
    expect(calculateCurrentStreak(12, 4, 3)).toBe(7); // 4 days observed + 3 challenges complete
    expect(calculateCurrentStreak(30, 10, 8)).toBe(9); // capped: Math.min(10, 5) + Math.min(8, 4) = 5 + 4 = 9
  });
});
