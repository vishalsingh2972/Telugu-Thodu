import { z } from "zod";

export const CallConfigSchema = z.object({
  phoneNumber: z.string(),
  questions: z.array(z.string()),
  status: z.enum(["INITIATED", "IN_PROGRESS", "COMPLETED", "FAILED"]),
});

export const WellnessReportSchema = z.object({
  callSid: z.string(),
  timestamp: z.string(),
  overallMood: z.enum(["GOOD", "NEUTRAL", "CONCERNED"]),
  aiNarrativeSummary: z.string(),
  customChecklistTracked: z.array(z.object({
    itemKey: z.string(),
    originalQuestion: z.string(),
    status: z.enum(["YES", "NO", "UNSURE"]),
    extractedDetails: z.string()
  }))
});

export type CallConfig = z.infer<typeof CallConfigSchema>;
export type WellnessReport = z.infer<typeof WellnessReportSchema>;