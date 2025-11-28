import { GoogleGenAI, Type } from "@google/genai";
import { JobCriteria } from "../types";

// NOTE: Do NOT expose production API keys in frontend bundles.
// In Vite, use `VITE_*` env vars (e.g. `VITE_API_KEY`) and prefer a backend proxy for requests.
const apiKey = ((import.meta as any).env?.VITE_API_KEY as string) || '';
const ai = new GoogleGenAI({ apiKey });

export const generateJobCriteria = async (description: string): Promise<JobCriteria | null> => {
  if (!apiKey) {
    // If running in production, do not silently fall back — fail loudly.
    if ((import.meta as any).env?.PROD) {
      console.error("No VITE_API_KEY found. Gemini API calls are disabled in production. Configure a backend proxy and set VITE_API_KEY.");
      return null;
    }

    console.warn("No VITE_API_KEY found. Returning mock criteria for development.");
    // Fallback for demo when running locally (development only)
    return {
      requiredSkills: ["React", "TypeScript"],
      preferredSkills: ["Tailwind"],
      minExperienceYears: 3,
      domain: "General",
      seniority: "Mid-Level"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract job criteria from this description: "${description}". 
      Return a JSON object with: 
      - requiredSkills (array of strings)
      - preferredSkills (array of strings)
      - minExperienceYears (number)
      - domain (string, e.g. Fintech, E-commerce)
      - seniority (string, e.g. Junior, Senior, Lead)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            requiredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            preferredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            minExperienceYears: { type: Type.NUMBER },
            domain: { type: Type.STRING },
            seniority: { type: Type.STRING },
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as JobCriteria;
    }
    return null;
  } catch (error) {
    console.error("Error generating criteria:", error);
    return null;
  }
};

export const generateCandidateExplanation = async (candidateName: string, candidateSkills: string[], jobCriteria: JobCriteria): Promise<string[]> => {
  if (!apiKey) {
    if ((import.meta as any).env?.PROD) {
      console.error("No VITE_API_KEY found. Gemini API calls are disabled in production. Configure a backend proxy and set VITE_API_KEY.");
      return ["Analysis unavailable currently."];
    }

    return [
      "Matches key required skills.",
      "Experience level aligns with the role.",
      "Good potential fit based on keywords."
    ];
  }

    try {
        const prompt = `
        Analyze the fit for candidate "${candidateName}" based on these criteria:
        Job Criteria: ${JSON.stringify(jobCriteria)}
        Candidate Skills: ${JSON.stringify(candidateSkills)}

        Provide 3 short, punchy bullet points explaining why they are a good or bad match.
        Focus on skills overlap and gaps.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as string[];
        }
        return [];
    } catch (error) {
        console.error("Error generating explanation:", error);
        return ["Analysis unavailable currently."];
    }
}
