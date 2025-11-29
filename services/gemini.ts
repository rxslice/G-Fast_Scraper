import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types";

const parseJSONSafe = (text: string) => {
  try {
    // Remove markdown code blocks if present (common LLM artifact)
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '');
    
    // Attempt to find JSON array brackets
    const start = cleanText.indexOf('[');
    const end = cleanText.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
      return JSON.parse(cleanText.substring(start, end + 1));
    }
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return [];
  }
};

export const searchLeads = async (
  keywords: string, 
  location: string,
  limit: number = 20
): Promise<{ leads: Lead[]; rawLinks: any[] }> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a precise data extraction engine.
    Search for local businesses matching "${keywords}" in "${location}" using Google Maps.
    
    Task: Retrieve approximately ${limit} businesses. Try to find as many distinct results as possible up to this limit.
    
    CRITICAL REQUIREMENT:
    You must accurately extract the "Website" field from the Google Maps listing.
    - If the business has a website linked on Maps, you MUST return the full URL.
    - Do not assume a business has no website just because it is not in the snippet. Look deeper.
    - Only return "N/A" if the "Website" field is explicitly missing or empty on the Maps profile.
    
    Return a STRICT JSON array of objects with these keys:
    - name (string)
    - category (string)
    - address (string)
    - phone (string, use 'N/A' if missing)
    - website (string, the actual URL or 'N/A')
    - rating (number, e.g. 4.5)
    - reviewCount (number)
    - socials (array of strings: e.g. ["facebook.com/...", "instagram.com/..."])
    
    Do not output any markdown formatting or explanation. Just the raw JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        temperature: 0.1, // Lower temperature for more factual/extraction-based output
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
      // Try to find a direct map link from grounding chunks, otherwise fallback to search query
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