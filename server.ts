/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Ensure data folder exists for simple local storage persistence
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// File paths
const LOGS_FILE = path.join(DATA_DIR, "logs.json");
const CHALLENGES_FILE = path.join(DATA_DIR, "challenges.json");
const BUDGET_FILE = path.join(DATA_DIR, "budget.json");

// Helper to load / save files
function loadJSON<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data) as T;
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultValue;
}

function saveJSON<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
  }
}

// Initial challenge list seed
const INITIAL_CHALLENGES = [
  {
    id: "challenge_1",
    title: "Ditch Car for Commute",
    description: "Opt for a transit bus, train, metro, or simple bicycling for your travel today.",
    category: "transport",
    potentialReduction: 12.0,
    completed: false,
    difficulty: "medium"
  },
  {
    id: "challenge_2",
    title: "Eco-Friendly Monday",
    description: "Consume purely vegan or organic plant-based meals today with zero meat or dairy waste.",
    category: "diet",
    potentialReduction: 4.5,
    completed: false,
    difficulty: "easy"
  },
  {
    id: "challenge_3",
    title: "Unplug Idle Devices",
    description: "Power down or unplug stand-by appliances (chargers, gaming units, monitors) overnight.",
    category: "energy",
    potentialReduction: 3.5,
    completed: false,
    difficulty: "easy"
  },
  {
    id: "challenge_4",
    title: "Carbon Offset Planting",
    description: "Pledge or record a tree planting or active composting session to directly subtract impact.",
    category: "offset",
    potentialReduction: 22.0,
    completed: false,
    difficulty: "hard"
  },
  {
    id: "challenge_5",
    title: "Zero Fast-Fashion Week",
    description: "Refuse purchasing synthetic apparel items. Learn to upcycle or source a thrift alternative.",
    category: "consumption",
    potentialReduction: 15.0,
    completed: false,
    difficulty: "medium"
  }
];

// Lazy-initialize Gemini SDK to prevent startup crashes if GEMINI_API_KEY is not defined
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set under environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Check if Gemini API key exists
function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      geminiConfigured: isGeminiConfigured()
    });
  });

  // Get all carbon footprint logs
  app.get("/api/logs", (req: Request, res: Response) => {
    const logs = loadJSON<any[]>(LOGS_FILE, []);
    res.json(logs);
  });

  // Add a new carbon log
  app.post("/api/logs", (req: Request, res: Response) => {
    try {
      const { category, subcategory, amount, unit, co2e, notes, date } = req.body;
      
      if (!category || !subcategory || amount === undefined || co2e === undefined || !unit || !date) {
        res.status(400).json({ error: "Missing required fields in request body." });
        return;
      }

      const logs = loadJSON<any[]>(LOGS_FILE, []);
      const newLog = {
        id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        category,
        subcategory,
        amount: Number(amount),
        unit,
        co2e: Number(co2e),
        notes: notes || "",
        date,
        createdAt: new Date().toISOString()
      };

      logs.push(newLog);
      saveJSON(LOGS_FILE, logs);

      res.status(201).json(newLog);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete a carbon log
  app.delete("/api/logs/:id", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      let logs = loadJSON<any[]>(LOGS_FILE, []);
      
      const exists = logs.some(l => l.id === id);
      if (!exists) {
        res.status(404).json({ error: "Carbon log not found." });
        return;
      }

      logs = logs.filter(l => l.id !== id);
      saveJSON(LOGS_FILE, logs);

      res.status(200).json({ message: "Carbon log deleted successfully.", id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get active eco challenges
  app.get("/api/challenges", (req: Request, res: Response) => {
    const challenges = loadJSON<any[]>(CHALLENGES_FILE, INITIAL_CHALLENGES);
    res.json(challenges);
  });

  // Toggle challenge completion status
  app.post("/api/challenges/toggle", (req: Request, res: Response) => {
    try {
      const { id } = req.body;
      if (!id) {
        res.status(400).json({ error: "Missing challenge ID." });
        return;
      }

      const challenges = loadJSON<any[]>(CHALLENGES_FILE, INITIAL_CHALLENGES);
      const challengeIndex = challenges.findIndex(c => c.id === id);

      if (challengeIndex === -1) {
        res.status(404).json({ error: "Challenge not found." });
        return;
      }

      challenges[challengeIndex].completed = !challenges[challengeIndex].completed;
      saveJSON(CHALLENGES_FILE, challenges);

      res.json(challenges[challengeIndex]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get monthly carbon budget and settings
  app.get("/api/budget", (req: Request, res: Response) => {
    const budgetData = loadJSON<{ monthlyBudget: number; profileArchetype?: string }>(BUDGET_FILE, { 
      monthlyBudget: 160, 
      profileArchetype: "individual" 
    });
    // Ensure profileArchetype has a fallback
    if (!budgetData.profileArchetype) {
      budgetData.profileArchetype = "individual";
    }
    res.json(budgetData);
  });

  // Save monthly carbon budget and settings
  app.post("/api/budget", (req: Request, res: Response) => {
    try {
      const { monthlyBudget, profileArchetype } = req.body;
      
      const savedData = loadJSON<{ monthlyBudget: number; profileArchetype?: string }>(BUDGET_FILE, { 
        monthlyBudget: 160, 
        profileArchetype: "individual" 
      });

      if (monthlyBudget !== undefined) {
        if (isNaN(Number(monthlyBudget)) || Number(monthlyBudget) <= 0) {
          res.status(400).json({ error: "Invalid monthly budget value. It must be a positive number." });
          return;
        }
        savedData.monthlyBudget = Number(monthlyBudget);
      }

      if (profileArchetype !== undefined) {
        savedData.profileArchetype = profileArchetype;
      }

      saveJSON(BUDGET_FILE, savedData);
      res.json(savedData);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Generate dynamic Gemini intelligence insights on logged metrics
  app.post("/api/gemini/insights", async (req: Request, res: Response) => {
    const logs = loadJSON<any[]>(LOGS_FILE, []);
    
    // Function to calculate and formulate high-fidelity local fallback response
    const buildLocalFallbackInsights = () => {
      let totalEmissions = 0;
      let totalOffsets = 0;
      const sumsByCategory: Record<string, number> = {
        transport: 0,
        energy: 0,
        diet: 0,
        consumption: 0,
        offset: 0
      };
      
      const logsByDate: Record<string, number> = {};
      
      logs.forEach(l => {
        const cat = l.category || "misc";
        const co2 = Number(l.co2e || 0);
        sumsByCategory[cat] = (sumsByCategory[cat] || 0) + co2;
        
        if (cat === "offset") {
          totalOffsets += Math.abs(co2);
        } else {
          totalEmissions += co2;
        }
        
        const dt = l.date ? l.date.substring(0, 10) : new Date().toISOString().substring(0, 10);
        logsByDate[dt] = (logsByDate[dt] || 0) + (cat === "offset" ? -Math.abs(co2) : co2);
      });
      
      const uniqueDates = Object.keys(logsByDate);
      const dayCount = uniqueDates.length || 1;
      const dailyAverage = Number(((totalEmissions - totalOffsets) / dayCount).toFixed(2));
      
      const sectorMapping: Record<string, string> = {
        transport: "Transportation",
        energy: "Home Energy",
        diet: "Diet & Food",
        consumption: "Shopping"
      };
      
      let highestCat = "None";
      let maxVal = -Infinity;
      Object.keys(sectorMapping).forEach(cat => {
        if (sumsByCategory[cat] > maxVal && sumsByCategory[cat] > 0) {
          maxVal = sumsByCategory[cat];
          highestCat = sectorMapping[cat];
        }
      });
      
      const goal = 5.4;
      const percentageDifferenceFromGoal = Math.round(((dailyAverage - goal) / goal) * 100);
      
      let overallEvaluation = "";
      if (logs.length === 0) {
        overallEvaluation = "Welcome! Create some carbon footprint logs above (e.g., commute distance, dietary habits, home power consumption, or eco offsets like tree planting) to trigger deep diagnostic carbon evaluations and tailored reduction advice.";
      } else {
        overallEvaluation = `Active tracker evaluation updated (Local Calculation). Based on your ${logs.length} recorded entries, your computed daily average footprint is ${dailyAverage} kg CO2e, which sits ${percentageDifferenceFromGoal >= 0 ? percentageDifferenceFromGoal + "% above" : Math.abs(percentageDifferenceFromGoal) + "% below"} the global climate target of 5.4 kg CO2e/day. `;
        if (highestCat !== "None") {
          overallEvaluation += `Your primary impact sector is currently ${highestCat}. We recommend prioritizing small, high-impact changes here first (e.g., opting for active transit, switching to heat pumps, or reducing ruminant beef dishes) to achieve high net-zero efficiency. `;
        }
        if (totalOffsets > 0) {
          overallEvaluation += `Incredible work on registering ${totalOffsets.toFixed(1)} kg of ecological offsets! Active compensation moves you closer to carbon neutral status.`;
        }
      }
      
      const fallbackRecommendations = [
        {
          title: "Opt for Micro-mobility Transit",
          category: "transport",
          impactKg: 12.5,
          details: "Substitute standard short-trip combustion car drives with active walking, bicycle commute, or a light electric scooter."
        },
        {
          title: "Adjust Home Thermostat Controls",
          category: "energy",
          impactKg: 18.0,
          details: "Lower your water heater target by 2-5 degrees, or adjust winter/summer room climate bounds by 1.5°C to save grid drawing."
        },
        {
          title: "Switch Beef with Green Protein",
          category: "diet",
          impactKg: 22.4,
          details: "Swap one ruminant beef or lamb plate for organic local vegetables or a sustainable legume/tofu vegan recipe."
        },
        {
          title: "Sort Plastics and Cardboard Out",
          category: "offset",
          impactKg: 4.5,
          details: "Divert household waste into secondary recycling bins, keeping paper and bio-scraps localized out of anaerobic landfills."
        }
      ];
      
      const recommendations = fallbackRecommendations.filter(r => r.category === highestCat.toLowerCase() || r.category === "offset");
      if (recommendations.length < 3) {
        fallbackRecommendations.forEach(r => {
          if (!recommendations.find(existing => existing.title === r.title) && recommendations.length < 3) {
            recommendations.push(r);
          }
        });
      }
      
      return {
        overallEvaluation,
        percentageDifferenceFromGoal: logs.length > 0 ? percentageDifferenceFromGoal : 0,
        highestSector: highestCat,
        recommendations,
        isOfflineFallback: true
      };
    };

    try {
      if (!isGeminiConfigured()) {
        // Instead of hard failing, we immediately return the beautiful calculated fallback
        res.json(buildLocalFallbackInsights());
        return;
      }

      // Format current logs succinctly for prompt efficiency
      const logsSummary = logs.slice(-40).map(l => ({
        date: l.date,
        category: l.category,
        sub: l.subcategory,
        amount: l.amount,
        unit: l.unit,
        co2e: l.co2e
      }));

      const client = getGeminiClient();

      // Load current profile archetype context to tailor AI response
      const budgetData = loadJSON<{ monthlyBudget: number; profileArchetype?: string }>(BUDGET_FILE, { 
        monthlyBudget: 160, 
        profileArchetype: "individual" 
      });
      const archetype = budgetData.profileArchetype || "individual";

      const prompt = `Analyze this user's carbon tracking history and recent logging. State an objective, encouraging summary of their carbon footprint trends and guide them on actionable pathways which yield maximum impact based on their log behavior.
      
      User Profile Settings & Context:
      - Selected Archetype: ${archetype} (Options: individual [household focus], digital_nomad [remote/nomad/travel focus], corporate [enterprise office spaces, grid power/monitors focus], small_business [local retail or organic green cafe focus]).
      - Monthly Carbon target limit: ${budgetData.monthlyBudget} kg CO2e.
      
      User Carbon Log Entries (last 40 entries, kg CO2e metrics included):
      ${JSON.stringify(logsSummary, null, 2)}
      
      Target parameters to compare against:
      - If archetype is name 'individual', compare daily average emissions to 5.4 kg CO2e target.
      - If archetype is name 'digital_nomad', compare to 6.5 kg CO2e target.
      - If archetype is name 'corporate', compare to 45.0 kg CO2e target.
      - If archetype is name 'small_business', compare to 25.0 kg CO2e target.
      
      Tailor all recommended actions, titles, weekly impact numbers (realistic savings between 1 and 200 kg CO2e depending on category and professional footprint scale), and overall evaluations to precisely fit their selected environment setting ("${archetype}"). Do not suggest residential tips if corporate or small_business is selected, focus instead on industry-standard mitigation avenues (e.g., cooling systems, bulk sourcing, cloud hosts, remote operations, solar).
      Output the analysis rigidly as JSON adhering strictly to the responseSchema provided. Make recommendations realistic, highly tailored, and hyper-actionable.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite Sustainability Architect. Provide deeply educational environmental feedback strictly in structured JSON, mapping out precise CO2 reduction steps.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallEvaluation: {
                type: Type.STRING,
                description: "Deep, conversational, sustainable appraisal explaining their carbon performance, highlighting positive trends or critical sectors needing adjustments."
              },
              percentageDifferenceFromGoal: {
                type: Type.NUMBER,
                description: "Calculated percentage comparing average daily emission in their logs against the 5.4 kg CO2e goal (e.g. 15 if 15% above goal, -10 if 10% below goal, 0 if no data)."
              },
              highestSector: {
                type: Type.STRING,
                description: "The sector displaying the highest emissions. Choose exactly from: 'Transportation', 'Home Energy', 'Diet & Food', 'Shopping', or 'None'."
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Highly actionable title for direct savings habit" },
                    category: { type: Type.STRING, description: "Relevant logged category like transport, energy, diet, consumption, offset" },
                    impactKg: { type: Type.NUMBER, description: "Factual estimated CO2e impact saved per week (approximate, realistic value between 1 and 50)" },
                    details: { type: Type.STRING, description: "Brief, high-conversion detail instruction of how to implement the change." }
                  },
                  required: ["title", "category", "impactKg", "details"]
                }
              }
            },
            required: ["overallEvaluation", "percentageDifferenceFromGoal", "highestSector", "recommendations"]
          }
        }
      });

      const responseText = response.text || "{}";
      const parsedInsights = JSON.parse(responseText);
      res.json(parsedInsights);
    } catch (err: any) {
      console.warn("Gemini Insights failed or API key was disabled/leaked. Falling back to local analytical insights:", err);
      try {
        res.json(buildLocalFallbackInsights());
      } catch (innerErr: any) {
        res.status(500).json({ error: "Failed to generate fallback insights. " + innerErr.message });
      }
    }
  });

  // Handle conversational eco-coaching chats
  app.post("/api/gemini/chat", async (req: Request, res: Response) => {
    const logs = loadJSON<any[]>(LOGS_FILE, []);
    const totalCO2LinesByCat = logs.reduce((acc, current) => {
      acc[current.category] = (acc[current.category] || 0) + current.co2e;
      return acc;
    }, {} as Record<string, number>);

    const buildLocalFallbackChat = (userMsg: string) => {
      const userText = userMsg.toLowerCase();
      let reply = "";

      if (userText.includes("car") || userText.includes("vehicle") || userText.includes("drive") || userText.includes("flight") || userText.includes("transport") || userText.includes("travel")) {
        reply = `Your transport footprint is of key significance! Standard combustion vehicles release approximately 170-180g of CO2e per average kilometer. Switching to light rail, hybrid powertrains, active cycling, or electric scooters cuts emissions by 75% to 95%. 

Your current registered transport emissions total is **${(totalCO2LinesByCat.transport || 0).toFixed(1)} kg CO2e**. Let's try to set a weekly active transit goal to cut back on car distance next week!`;
      } else if (userText.includes("diet") || userText.includes("food") || userText.includes("meal") || userText.includes("beef") || userText.includes("meat") || userText.includes("vegan")) {
        reply = `Dietary choice is an incredibly powerful lever for personal carbon footprints. Raising beef or lamb creates up to 30 times more greenhouse emissions than equivalent plant-based proteins.

By choosing chicken or sustainable fish over beef, you save more than 50% of the emissions. Transitioning to vegetarian or vegan meals drops your dietary impact to under 0.5 kg CO2e per dish. Your currently logged diet total is **${(totalCO2LinesByCat.diet || 0).toFixed(1)} kg CO2e**. Try logging a complete vegan harvest day!`;
      } else if (userText.includes("energy") || userText.includes("electricity") || userText.includes("heat") || userText.includes("power") || userText.includes("utility")) {
        reply = `Home heating, air conditioning, and older home appliances account for roughly 20-30% of average household emissions. 

Adjusting climate control levels by just 1.5°C or using energy-saving electric heat pumps yields deep structural reductions. Your current home energy total is **${(totalCO2LinesByCat.energy || 0).toFixed(1)} kg CO2e**. Consider checking if your utility supplier offers acertified 100% green renewable power option.`;
      } else if (userText.includes("offset") || userText.includes("tree") || userText.includes("compost") || userText.includes("recycle")) {
        reply = `Offsets help repair the natural carbon sink. Planting a native tree traps about 22kg of CO2 per year over its lifecycle. Active kitchen waste composting prevents oxygen-deprived decay, which otherwise produces high-potency methane gas.

Your total offset credits logged stand at **-${(totalCO2LinesByCat.offset || 0).toFixed(1)} kg CO2e**. You are doing phenomenal work keeping resources circular and sorted!`;
      } else if (userText.includes("shopping") || userText.includes("cloth") || userText.includes("item") || userText.includes("electronics") || userText.includes("buy")) {
        reply = `Supply chain manufacturing is carbon-intensive. Fast fashion items made of synthetic polyester require petroleum-based raw materials. 

Thrifting or finding pre-owned, upcycled garments bypasses production energy. Your shopping carbon total stands at **${(totalCO2LinesByCat.consumption || 0).toFixed(1)} kg CO2e**. Aiming for durable, long-life goods is a fantastic sustainability victory!`;
      } else if (userText.includes("hello") || userText.includes("hi ") || userText.includes("hey") || userText.includes("who are you") || userText.includes("help")) {
        reply = `Hello! I am your AI Carbon Coach, running in secure offline assistance mode. 

I'm ready to counsel you on any eco-habits or environmental topics! You can ask about reducing transport emissions, green electrical appliances, diet replacements, tree offsetting, or smart consumption. What aspect of your carbon trace would you like to discuss today?`;
      } else {
        const netFootprint = (totalCO2LinesByCat.transport || 0) + (totalCO2LinesByCat.energy || 0) + (totalCO2LinesByCat.diet || 0) + (totalCO2LinesByCat.consumption || 0) - (totalCO2LinesByCat.offset || 0);
        reply = `Hello! I am here as your Carbon Coach. Looking at your records, your net footprint is **${netFootprint.toFixed(1)} kg CO2e** across **${logs.length}** trace entries. 

You can ask me questions about transport alternatives, eco energy tips, diet carbon factors, composting, or thriting garments. Let's work together to drive your trace further down!`;
      }

      return { text: reply };
    };

    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Missing messages list." });
        return;
      }

      if (!isGeminiConfigured()) {
        const lastUser = messages[messages.length - 1];
        res.json(buildLocalFallbackChat(lastUser ? lastUser.text : ""));
        return;
      }

      const summaryContext = `
      User Current Aggregate Carbon Summary:
      - Transportation: ${totalCO2LinesByCat.transport || 0} kg CO2e
      - Home Energy: ${totalCO2LinesByCat.energy || 0} kg CO2e
      - Diet & Food: ${totalCO2LinesByCat.diet || 0} kg CO2e
      - Consumption: ${totalCO2LinesByCat.consumption || 0} kg CO2e
      - Offsets Logged: ${totalCO2LinesByCat.offset || 0} kg CO2e
      - Total Logs Count: ${logs.length}
      `;

      // Set up simple chat history message formatting for generateContent
      const formattedContents = messages.map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      // Load current profile archetype context to tailor chatbot response
      const budgetData = loadJSON<{ monthlyBudget: number; profileArchetype?: string }>(BUDGET_FILE, { 
        monthlyBudget: 160, 
        profileArchetype: "individual" 
      });
      const archetype = budgetData.profileArchetype || "individual";

      // Helper friendly description for archetype
      const archetypeDescriptions: Record<string, string> = {
        individual: "Household (Eco-Citizen) - focuses on household diet, commute, and consumer items.",
        digital_nomad: "Digital Nomad & Tech Remote Worker - focuses on travel miles, co-working power, and remote servers.",
        corporate: "Corporate Office Space - focuses on enterprise heating/cooling, cloud hosts, monitor rigs, and transport emissions.",
        small_business: "Small Business / Green Cafe - focuses on local retail operations, circular supply chains, organic cooking, and cooling appliances."
      };

      // Integrate standard system instructions
      const systemInstruction = `You are a supportive, friendly, yet scientifically authoritative personal Carbon Coach.
      Your mission is to help the user understand climate impact, reduce greenhouse gas emissions, and adopt comfortable sustainability habits.
      
      Currently, the user is utilizing the platform under the profile archetype: "${archetypeDescriptions[archetype] || archetype}".
      Make sure to tailor all answers, suggestions, operational analysis, and tips to perfectly match this profile context! For example, if corporate or small business is selected, speak to corporate settings and tracking invisible operational costs (e.g. server workloads, facility operations, supply metrics).
      Refer occasionally to their actual aggregate logging metrics where appropriate to make recommendations personal and highly tailored.
      
      User Carbon Metrics Context:
      ${summaryContext}
      
      Keep answers engaging, friendly, conversational, and split into clean paragraphs or bullet points under 200 words for mobile screen readability.`;

      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7
        }
      });

      const replyText = response.text || "I am here on standby as your carbon coaching companion! Feel free to ask any eco-questions.";
      res.json({ text: replyText });
    } catch (err: any) {
      console.warn("Gemini Chat failed or API key was disabled/leaked. Falling back to local responder:", err);
      try {
        const { messages } = req.body;
        const lastUser = messages && messages.length > 0 ? messages[messages.length - 1] : { text: "" };
        res.json(buildLocalFallbackChat(lastUser ? lastUser.text : ""));
      } catch (innerErr) {
        res.status(500).json({ error: "Failed to build fallback chat answer." });
      }
    }
  });

  // --- VITE MIDDLEWARE SETUP ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted for development reload.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static assets from dist folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Carbon Footprint Tracker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
