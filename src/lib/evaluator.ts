import { GoogleGenAI, Type } from '@google/genai';
import { WellnessReport, WellnessReportSchema } from './schemas';

// Initialize the Google Gen AI Client using our environment token
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * generateMedicalReport
 * Cross-references the targeted health question with the user's spoken response
 * and utilizes Gemini to generate your structurally enforced wellness analysis.
 */
export async function generateMedicalReport(
  callSid: string,
  questionAsked: string,
  translatedTranscript: string
): Promise<WellnessReport> {
  try {
    console.log("Initializing Gemini Medical Analysis Model...");

    const systemInstruction = `
      You are an expert remote care physician and healthcare analyst.
      Your job is to analyze a patient's spoken answer to a specific health check-in question.
      
      Review the question that was asked, and analyze the translated transcript of their spoken response.
      Determine their overall mood, determine if they gave a clear YES, NO, or UNSURE status to the question, and write a scannable narrative summary for their family members.
      
      CRITICAL MOOD CRITERIA:
      - GOOD: Symptoms are improving, gone, or they state they are doing fine.
      - NEUTRAL: Stable condition, standard routine response, or minor persistent complaints.
      - CONCERNED: Showing distress, severe symptoms, confusion, pain, or forgetting critical medications.
    `.trim();

    const userPrompt = `
      Check-In Context:
      - Question Asked by System: "${questionAsked}"
      - Patient's Translated Answer: "${translatedTranscript}"
    `.trim();

    // Requesting structured JSON directly from Gemini matching your exact Schema layout
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // Safe, low temperature for predictable clinical extractions
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallMood: { type: Type.STRING, enum: ['GOOD', 'NEUTRAL', 'CONCERNED'] },
            aiNarrativeSummary: { type: Type.STRING },
            customChecklistTracked: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemKey: { type: Type.STRING },
                  originalQuestion: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['YES', 'NO', 'UNSURE'] },
                  extractedDetails: { type: Type.STRING }
                },
                required: ['itemKey', 'originalQuestion', 'status', 'extractedDetails']
              }
            }
          },
          required: ['overallMood', 'aiNarrativeSummary', 'customChecklistTracked'],
        }
      }
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Gemini returned an empty response string.");
    }

    // Parse what Gemini sent back
    const geminiData = JSON.parse(rawText);

    // Inject the root-level fields (callSid and timestamp) that your original schema expects
    const fullReportPayload = {
      callSid: callSid,
      timestamp: new Date().toISOString(),
      overallMood: geminiData.overallMood,
      aiNarrativeSummary: geminiData.aiNarrativeSummary,
      customChecklistTracked: geminiData.customChecklistTracked.map((item: any, idx: number) => ({
        itemKey: item.itemKey || `q-${idx + 1}`,
        originalQuestion: questionAsked, // Ensuring it anchors back to the asked question
        status: item.status,
        extractedDetails: item.extractedDetails
      }))
    };

    // Double-validate via your existing Zod layer to guarantee runtime type safety
    const validatedReport = WellnessReportSchema.parse(fullReportPayload);

    console.log("[Gemini Engine Success] Generated Validated Health Report:", validatedReport);
    return validatedReport;

  } catch (error) {
    console.error("Pipeline Exception caught inside Gemini Intelligence Module:", error);
    
    // Fail-safe payload that conforms to your schema so the server never breaks on timeouts
    return {
      callSid: callSid,
      timestamp: new Date().toISOString(),
      overallMood: 'NEUTRAL',
      aiNarrativeSummary: 'System experienced a processing exception during analysis. Raw logs saved.',
      customChecklistTracked: [
        {
          itemKey: 'error-fallback',
          originalQuestion: questionAsked,
          status: 'UNSURE',
          extractedDetails: 'Analysis pipeline fallback executed.'
        }
      ]
    };
  }
}