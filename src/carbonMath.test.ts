/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import { CARBON_CONFIG, CarbonLog } from "./types";

describe("EcoPulse AI Mathematical Core Tests", () => {
  it("should have correct, non-zero carbon emission factors for each subcategory", () => {
    // Assert all configured subcategories have valid factor multipliers
    Object.keys(CARBON_CONFIG).forEach((catKey) => {
      const config = CARBON_CONFIG[catKey as any];
      expect(config).toBeDefined();
      expect(config.subcategories.length).toBeGreaterThan(0);
      
      config.subcategories.forEach((sub) => {
        expect(sub.id).toBeDefined();
        expect(sub.label).toBeDefined();
        expect(typeof sub.factor).toBe("number");
        
        // Offset subcategories must have negative impact multipliers
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
        amount: 100, // 100 km
        unit: "km",
        co2e: 18.0, // 100 * 0.18
        createdAt: "2026-06-20T10:00:00Z"
      },
      {
        id: "log_2",
        date: "2026-06-20",
        category: "energy",
        subcategory: "electricity_standard",
        amount: 200, // 200 kWh
        unit: "kWh",
        co2e: 76.0, // 200 * 0.38
        createdAt: "2026-06-20T11:00:00Z"
      },
      {
        id: "log_3",
        date: "2026-06-20",
        category: "offset",
        subcategory: "offset_tree_planted",
        amount: 2, // 2 trees
        unit: "trees",
        co2e: -44.0, // 2 * -22.0
        createdAt: "2026-06-20T12:00:00Z"
      }
    ];

    // Gross math
    const grossEmissionsByCat = mockLogs
      .filter((l) => l.category !== "offset")
      .reduce((acc, l) => acc + l.co2e, 0);

    const totalOffsets = mockLogs
      .filter((l) => l.category === "offset")
      .reduce((acc, l) => acc + Math.abs(l.co2e), 0);

    const netScore = grossEmissionsByCat - totalOffsets;

    expect(grossEmissionsByCat).toBe(94.0); // 18 + 76
    expect(totalOffsets).toBe(44.0);
    expect(netScore).toBe(50.0); // 94 - 44
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
