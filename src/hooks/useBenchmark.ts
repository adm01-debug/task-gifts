import { useQuery } from "@tanstack/react-query";
import { benchmarkService, BenchmarkComparison } from "@/services/benchmarkService";
import { ClimatePillar } from "@/services/climateSurveyService";

export function useBenchmarks(filters?: {
  industry?: string;
  companySize?: string;
  region?: string;
  period?: string;
}) {
  return useQuery({
    queryKey: ['benchmarks', filters],
    queryFn: () => benchmarkService.getBenchmarks(filters),
  });
}

export function useIndustries() {
  return useQuery({
    queryKey: ['benchmark-industries'],
    queryFn: () => benchmarkService.getIndustries(),
  });
}

export function useBenchmarkComparison(
  yourScores: Record<ClimatePillar, number> | null,
  industry: string,
  companySize?: string,
  region?: string
) {
  return useQuery({
    queryKey: ['benchmark-comparison', yourScores, industry, companySize, region],
    queryFn: () => benchmarkService.compareWithBenchmark(yourScores!, industry, companySize, region),
    enabled: !!yourScores && !!industry,
  });
}

export function useENPSBenchmark(industry: string) {
  return useQuery({
    queryKey: ['enps-benchmark', industry],
    queryFn: () => benchmarkService.getENPSBenchmark(industry),
    enabled: !!industry,
  });
}

export function useBenchmarkInsights(comparisons: BenchmarkComparison[] | null) {
  return useQuery({
    queryKey: ['benchmark-insights', comparisons],
    queryFn: () => benchmarkService.generateInsights(comparisons!),
    enabled: !!comparisons && comparisons.length > 0,
  });
}
