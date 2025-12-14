import { supabase } from "@/integrations/supabase/client";
import { logger } from "./loggingService";

export interface ChurnPrediction {
  userId: string;
  displayName: string;
  riskLevel: "high" | "medium";
  riskScore: number;
  riskIndicators: string[];
  interventionSuggestions: string[];
  metrics?: {
    daysInactive: number;
    streak: number;
    punctualityRate: number;
    recentXpGain: number;
  };
}

export interface ChurnPredictionSummary {
  totalAnalyzed: number;
  highRiskCount: number;
  mediumRiskCount: number;
  overallHealthScore: number;
}

export interface ChurnPredictionResponse {
  predictions: ChurnPrediction[];
  summary: ChurnPredictionSummary;
}

export const churnPredictionService = {
  async getPredictions(): Promise<ChurnPredictionResponse> {
    const { data, error } = await supabase.functions.invoke('churn-prediction');

    if (error) {
      logger.apiError("Error fetching churn predictions", error, "churnPredictionService");
      throw error;
    }

    return data as ChurnPredictionResponse;
  }
};
