/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Category types
export type CarbonCategory = "transport" | "energy" | "diet" | "consumption" | "offset";

// Subcategory definitions for tracking details
export interface SubcategoryMeta {
  id: string;
  label: string;
  unit: string;
  factor: number; // kg CO2e per unit
  description: string;
}

// Category config mapping
export const CARBON_CONFIG: Record<CarbonCategory, { label: string; color: string; subcategories: SubcategoryMeta[] }> = {
  transport: {
    label: "Transportation",
    color: "#3b82f6", // Blue
    subcategories: [
      { id: "car_petrol", label: "Gasoline Car", unit: "km", factor: 0.18, description: "Average petrol combustion vehicle" },
      { id: "car_diesel", label: "Diesel Car", unit: "km", factor: 0.17, description: "Average diesel combustion vehicle" },
      { id: "car_hybrid", label: "Hybrid Car (HEV/PHEV)", unit: "km", factor: 0.09, description: "Highly efficient hybrid gasoline/electric powertrain" },
      { id: "car_electric", label: "Electric Car (BEV)", unit: "km", factor: 0.04, description: "Powered by clean battery energy connected to the power grid" },
      { id: "motorcycle", label: "Motorcycle / Scooter", unit: "km", factor: 0.10, description: "Sub-compact combustion motor transit" },
      { id: "public_bus", label: "Transit Bus", unit: "km", factor: 0.08, description: "Standard city or commuter bus transit" },
      { id: "public_train", label: "Subway / Intercity Rail", unit: "km", factor: 0.03, description: "Urban electric rail, rapid transit, or tramway" },
      { id: "escooter", label: "E-Bike / E-Scooter", unit: "km", factor: 0.005, description: "Micro-mobility battery-electric device with minimal draw" },
      { id: "flight_short", label: "Regional Flight (<3 h)", unit: "km", factor: 0.15, description: "Regional domestic aviation routes" },
      { id: "flight_long", label: "International Flight (>3 h)", unit: "km", factor: 0.11, description: "Transcontinental long-haul travel" },
      { id: "bicycle", label: "Bicycle / Active Walk", unit: "km", factor: 0.0, description: "Completely human-powered emission-free transit" }
    ]
  },
  energy: {
    label: "Home Energy",
    color: "#f59e0b", // Amber
    subcategories: [
      { id: "electricity_standard", label: "Standard Grid Power", unit: "kWh", factor: 0.38, description: "Average energy grid electricity utility mix" },
      { id: "electricity_renewable", label: "Green Renewable Power", unit: "kWh", factor: 0.01, description: "Certified low-impact solar or wind power subscription" },
      { id: "heating_gas", label: "Natural Gas Boiler", unit: "kWh", factor: 0.20, description: "Standard residential gas heating system usage" },
      { id: "heating_oil", label: "Heating Oil / Propane", unit: "kWh", factor: 0.27, description: "Private residential heating oil or LPG fuel burner" },
      { id: "heating_heatpump", label: "Electric Heat Pump", unit: "kWh", factor: 0.11, description: "Highly efficient climate control heating/cooling system" },
      { id: "heating_biomass", label: "Biomass Wood Fuel", unit: "kWh", factor: 0.02, description: "Eco-friendly wood pellet residential stove burner" },
      { id: "air_conditioning", label: "Air Conditioning Unit", unit: "kWh", factor: 0.35, description: "Active indoor refrigeration cooling powered by grid" }
    ]
  },
  diet: {
    label: "Diet & Food",
    color: "#10b981", // Emerald
    subcategories: [
      { id: "meal_meat_heavy", label: "High-Impact Meat (Beef/Lamb)", unit: "meals", factor: 3.2, description: "Contains ruminant beef, lamb, high-methane intensive agriculture" },
      { id: "meal_meat_average", label: "Low-Impact Meat (Chicken/Pork)", unit: "meals", factor: 1.6, description: "Plate with monogastric poultry, pork, or general meats" },
      { id: "meal_seafood", label: "Sustainable Seafood / Fish", unit: "meals", factor: 1.1, description: "Wild-caught or sustainably farmed aquatic meal selections" },
      { id: "meal_vegetarian", label: "Vegetarian (Egg/Dairy)", unit: "meals", factor: 0.7, description: "Meatless recipe containing dairy, cheese, or eggs" },
      { id: "meal_vegan", label: "Vegan (Plant-Based)", unit: "meals", factor: 0.45, description: "Strictly plant-based raw or processed ingredients" },
      { id: "meal_local_seasonal", label: "Organic Local Harvest Plate", unit: "meals", factor: 0.3, description: "Seasonally harvested within local radius tracking minimal transit" }
    ]
  },
  consumption: {
    label: "Shopping & Consumption",
    color: "#8b5cf6", // Purple
    subcategories: [
      { id: "item_clothing", label: "New Apparel / Fast Fashion", unit: "items", factor: 16.0, description: "New synthetic polyester dress, jeans, or synthetic casual wear" },
      { id: "item_secondhand", label: "Second-Hand / Thrift Item", unit: "items", factor: 1.2, description: "Reused garments bypassing manufacturing production emissions" },
      { id: "item_electronics", label: "Consumer Tech & Phones", unit: "items", factor: 85.0, description: "Smartphones, portable computers, displays, or high-refinement items" },
      { id: "item_appliance_large", label: "Major Structural Appliance", unit: "items", factor: 160.0, description: "High-volume washing machines, refrigerators, oven appliances" },
      { id: "item_furniture", label: "Furniture / Decor Upgrade", unit: "items", factor: 42.0, description: "Heavy household wood, composite panels, or assembled chairs" },
      { id: "item_book_stationary", label: "Books & Paper Goods", unit: "items", factor: 2.2, description: "Bound publications or heavy printed stationery" },
      { id: "item_misc", label: "Plastic Commodities", unit: "items", factor: 4.5, description: "Plastic-wrapped retail consumables or commercial toiletries" }
    ]
  },
  offset: {
    label: "Active Offsets & Reductions",
    color: "#ec4899", // Pink
    subcategories: [
      { id: "offset_tree_planted", label: "Tree Planted & Maintained", unit: "trees", factor: -22.0, description: "Annualized CO2 structural sequestration captured per active healthy tree" },
      { id: "offset_solar_gen", label: "Solar Rooftop Feed-in", unit: "kWh", factor: -0.38, description: "Renewable energy fed back directly to offset the grid electricity draw" },
      { id: "offset_recycling", label: "Waste Bulk Recycle Sorting", unit: "bins", factor: -1.5, description: "Careful paper, metal, and cardboard recovery keeping out of landfill" },
      { id: "offset_composting", label: "Organic Kitchen Composting", unit: "days", factor: -0.8, description: "Aerobic household compost decomposition preventing organic methane release" },
      { id: "offset_climate_credit", label: "Gold Standard Carbon Offset", unit: "credits", factor: -15.0, description: "Purchase of a certified high-quality carbon offset token" },
      { id: "offset_water_saving", label: "Low-Flow Eco Hot Shower", unit: "showers", factor: -0.4, description: "Avoiding massive gas/electric direct burner water heating" }
    ]
  }
};

// Represents a logged entry
export interface CarbonLog {
  id: string;
  date: string; // YYYY-MM-DD
  category: CarbonCategory;
  subcategory: string;
  amount: number;
  unit: string;
  co2e: number; // calculated in kg CO2e
  notes?: string;
  createdAt: string;
}

// Monthly statistical summary
export interface MonthlySummary {
  month: string; // YYYY-MM
  transport: number;
  energy: number;
  diet: number;
  consumption: number;
  offset: number;
  total: number;
}

// AI Weekly Eco challenge
export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  category: CarbonCategory;
  potentialReduction: number; // kg CO2e per week
  completed: boolean;
  difficulty: "easy" | "medium" | "hard";
}

// AI Coach Chat Message
export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

// Overall User Stats
export interface UserStats {
  dailyAverage: number; // kg CO2e
  carbonFootprintRanking: "excellent" | "average" | "high"; // Compared to global targets
  streakDays: number;
  totalSaved: number; // Offsets combined
}
