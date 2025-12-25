import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsService, type ReportTemplate, type GeneratedReport } from "@/services/reportsService";
import { toast } from "sonner";

export const useReportTemplates = (category?: string) => {
  return useQuery({
    queryKey: ['report-templates', category],
    queryFn: () => reportsService.getTemplates(category),
  });
};

export const useReportTemplate = (id: string) => {
  return useQuery({
    queryKey: ['report-template', id],
    queryFn: () => reportsService.getTemplateById(id),
    enabled: !!id,
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, filters }: { templateId: string; filters?: Record<string, unknown> }) =>
      reportsService.generateReport(templateId, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] });
      toast.success('Relatório gerado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao gerar relatório');
    }
  });
};

export const useEngagementSummary = (departmentId?: string) => {
  return useQuery({
    queryKey: ['engagement-summary', departmentId],
    queryFn: () => reportsService.getEngagementSummary(departmentId),
  });
};

export const useTalentSummary = (departmentId?: string) => {
  return useQuery({
    queryKey: ['talent-summary', departmentId],
    queryFn: () => reportsService.getTalentSummary(departmentId),
  });
};

export const useAnalyticsMetrics = (period: string = 'month') => {
  return useQuery({
    queryKey: ['analytics-metrics', period],
    queryFn: () => reportsService.getAnalyticsMetrics(period),
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: ({ reportId, format }: { reportId: string; format: 'pdf' | 'excel' | 'csv' }) =>
      reportsService.exportReport(reportId, format),
    onSuccess: (url) => {
      toast.success('Exportação iniciada!');
      // Em produção, abriria o download
      console.log('Download URL:', url);
    },
  });
};

export const useCreateReportTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: Omit<ReportTemplate, 'id' | 'created_at'>) =>
      reportsService.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
      toast.success('Template criado!');
    },
  });
};
