import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types";

const parseJSONSafe = (text: string) => {
  try {
    // Attempt to find JSON array brackets if there's extra text
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.substring(start, end + 1));
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return [];
  }
};

export const searchLeads = async (
  keywords: string, 
  location: string
): Promise<{ leads: Lead[]; rawLinks: any[] }> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Find business leads for "${keywords}" in "${location}" using Google Maps.
    
    Return a STRICT JSON array of objects.
    Each object must have the following fields:
    - name (string)
    - category (string)
    - address (string)
    - phone (string, use 'N/A' if not found)
    - website (string, use 'N/A' if not found)
    - rating (number)
    - reviewCount (number)
    - socials (array of strings, e.g., ["facebook.com/...", "instagram.com/..."]) - Try to find social profiles if website is missing.
    
    Try to find at least 10 results.
    Do not include markdown formatting like \`\`\`json. Just return the raw JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        temperature: 0.4, 
      },
    });

    const text = response.text || "[]";
    const data = parseJSONSafe(text);
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const leads: Lead[] = Array.isArray(data) ? data.map((item: any, index: number) => ({
      id: `lead-${Date.now()}-${index}`,
      name: item.name || "Unknown Business",
      category: item.category || "General",
      address: item.address || "No Address",
      phone: item.phone || "N/A",
      website: item.website || "N/A",
      socials: Array.isArray(item.socials) ? item.socials : [],
      rating: Number(item.rating) || 0,
      reviewCount: Number(item.reviewCount) || 0,
      status: 'New',
      isSaved: false,
      mapUrl: chunks.find((c: any) => c.web?.title?.includes(item.name) || c.maps?.title?.includes(item.name))?.maps?.uri 
              || chunks.find((c: any) => c.web?.title?.includes(item.name) || c.maps?.title?.includes(item.name))?.web?.uri
              || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + " " + location)}`
    })) : [];

    return { leads, rawLinks: chunks };

  } catch (error) {
    console.error("Gemini Scrape Error:", error);
    throw error;
  }
};

export const generateOutreachScript = async (lead: Lead, type: 'web-design' | 'voice-agent'): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API Key is missing.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = type === 'web-design' 
        ? `Write a short, punchy cold call script to sell a website service to "${lead.name}". They currently have no website (or a poor one). Mention their rating of ${lead.rating} if it's good, or how a site helps reviews if it's bad. Keep it conversational.`
        : `Write a short, professional cold call script to sell an AI Voice Receptionist agent to "${lead.name}". Focus on how they can miss calls at "${lead.address}" during busy times. Keep it under 100 words.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    return response.text || "Could not generate script.";
};