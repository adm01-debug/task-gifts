import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/loggingService";
import type { ClimatePillar } from "./climateSurveyService";

export interface ClimateBenchmark {
  id: string;
  pillar: ClimatePillar;
  industry: string;
  company_size: string;
  region: string;
  period: string;
  average_score: number;
  top_quartile_score: number;
  top_10_percent_score: number;
  sample_size: number;
  created_at: string;
  updated_at: string;
}

export interface BenchmarkComparison {
  pillar: ClimatePillar;
  yourScore: number;
  industryAverage: number;
  topQuartile: number;
  top10Percent: number;
  position: 'above' | 'below' | 'at';
  percentile: number;
}

export const benchmarkService = {
  async getBenchmarks(filters?: {
    industry?: string;
    companySize?: string;
    region?: string;
    period?: string;
  }): Promise<ClimateBenchmark[]> {
    let query = supabase
      .from('climate_benchmarks')
      .select('*');

    if (filters?.industry) query = query.eq('industry', filters.industry);
    if (filters?.companySize) query = query.eq('company_size', filters.companySize);
    if (filters?.region) query = query.eq('region', filters.region);
    if (filters?.period) query = query.eq('period', filters.period);

    const { data, error } = await query;
    if (error) {
      logger.error('Failed to fetch benchmarks', 'BenchmarkService', error);
      throw error;
    }
    return (data || []) as unknown as ClimateBenchmark[];
  },

  async getIndustries(): Promise<string[]> {
    const { data, error } = await supabase
      .from('climate_benchmarks')
      .select('industry')
      .order('industry');

    if (error) {
      logger.error('Failed to fetch industries', 'BenchmarkService', error);
      throw error;
    }

    const industries = [...new Set((data || []).map(d => d.industry))];
    return industries;
  },

  async compareWithBenchmark(
    yourScores: Record<ClimatePillar, number>,
    industry: string,
    companySize: string = 'all',
    region: string = 'brazil'
  ): Promise<BenchmarkComparison[]> {
    const benchmarks = await this.getBenchmarks({ industry, companySize, region });

    const comparisons: BenchmarkComparison[] = [];

    for (const [pillar, yourScore] of Object.entries(yourScores)) {
      const benchmark = benchmarks.find(b => b.pillar === pillar);
      
      if (benchmark) {
        let position: 'above' | 'below' | 'at' = 'at';
        let percentile = 50;

        if (yourScore >= benchmark.top_10_percent_score) {
          position = 'above';
          percentile = 90 + ((yourScore - benchmark.top_10_percent_score) / (100 - benchmark.top_10_percent_score)) * 10;
        } else if (yourScore >= benchmark.top_quartile_score) {
          position = 'above';
          percentile = 75 + ((yourScore - benchmark.top_quartile_score) / (benchmark.top_10_percent_score - benchmark.top_quartile_score)) * 15;
        } else if (yourScore >= benchmark.average_score) {
          position = 'above';
          percentile = 50 + ((yourScore - benchmark.average_score) / (benchmark.top_quartile_score - benchmark.average_score)) * 25;
        } else {
          position = 'below';
          percentile = (yourScore / benchmark.average_score) * 50;
        }

        comparisons.push({
          pillar: pillar as ClimatePillar,
          yourScore,
          industryAverage: benchmark.average_score,
          topQuartile: benchmark.top_quartile_score,
          top10Percent: benchmark.top_10_percent_score,
          position,
          percentile: Math.round(percentile),
        });
      }
    }

    return comparisons;
  },

  async getENPSBenchmark(industry: string): Promise<{
    average: number;
    topQuartile: number;
    top10Percent: number;
  }> {
    // eNPS benchmarks por indústria (dados simulados baseados em pesquisas de mercado)
    const enpsBenchmarks: Record<string, { average: number; topQuartile: number; top10Percent: number }> = {
      technology: { average: 35, topQuartile: 52, top10Percent: 68 },
      finance: { average: 28, topQuartile: 45, top10Percent: 60 },
      retail: { average: 22, topQuartile: 38, top10Percent: 52 },
      healthcare: { average: 30, topQuartile: 48, top10Percent: 62 },
      manufacturing: { average: 25, topQuartile: 42, top10Percent: 55 },
      services: { average: 31, topQuartile: 47, top10Percent: 61 },
      education: { average: 33, topQuartile: 50, top10Percent: 65 },
      government: { average: 18, topQuartile: 32, top10Percent: 45 },
      default: { average: 28, topQuartile: 45, top10Percent: 58 },
    };

    return enpsBenchmarks[industry] || enpsBenchmarks.default;
  },

  async generateInsights(comparisons: BenchmarkComparison[]): Promise<{
    prioritize: BenchmarkComparison[];
    maintain: BenchmarkComparison[];
    attention: BenchmarkComparison[];
  }> {
    const sortedByGap = [...comparisons].sort((a, b) => 
      (a.yourScore - a.industryAverage) - (b.yourScore - b.industryAverage)
    );

    const prioritize = sortedByGap.filter(c => c.yourScore < c.industryAverage - 5);
    const maintain = sortedByGap.filter(c => c.yourScore >= c.topQuartile);
    const attention = sortedByGap.filter(c => 
      c.yourScore >= c.industryAverage - 5 && 
      c.yourScore < c.industryAverage + 5 &&
      !maintain.includes(c)
    );

    return { prioritize, maintain, attention };
  },
};
