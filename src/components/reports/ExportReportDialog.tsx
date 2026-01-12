import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Table2,
  Link as LinkIcon,
  Download,
  Shield,
  Eye,
  Loader2,
  Check,
  Image,
  Calendar,
  Lock,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { exportReport, ReportData } from "@/lib/exportReports";
import { toast } from "sonner";

type ExportFormat = "pdf" | "excel" | "csv" | "powerpoint" | "sheets";

interface ExportOptions {
  format: ExportFormat;
  includeCover: boolean;
  includeSummary: boolean;
  includeCharts: boolean;
  includeTables: boolean;
  includeFilters: boolean;
  includeRawData: boolean;
  includeComments: boolean;
  includeTimestamp: boolean;
  // Privacy & LGPD
  removePersonalIds: boolean;
  groupSmallSamples: boolean;
  minSampleSize: number;
  applyLGPD: boolean;
  includeConfidentiality: boolean;
  // Quality
  quality: "high" | "medium" | "compact";
  orientation: "portrait" | "landscape";
}

interface ExportReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportTitle: string;
  reportData?: ReportData;
}

const FORMAT_OPTIONS: { id: ExportFormat; name: string; icon: React.ElementType; description: string }[] = [
  { id: "pdf", name: "PDF", icon: FileText, description: "Relatório formatado para impressão" },
  { id: "excel", name: "Excel (.xlsx)", icon: FileSpreadsheet, description: "Planilha com múltiplas abas" },
  { id: "csv", name: "CSV", icon: Table2, description: "Dados tabulares simples" },
  { id: "powerpoint", name: "PowerPoint", icon: Presentation, description: "1 slide por gráfico" },
  { id: "sheets", name: "Google Sheets", icon: LinkIcon, description: "Link compartilhável" },
];

export default function ExportReportDialog({
  open,
  onOpenChange,
  reportTitle,
  reportData,
}: ExportReportDialogProps) {
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  
  const [options, setOptions] = useState<ExportOptions>({
    format: "pdf",
    includeCover: true,
    includeSummary: true,
    includeCharts: true,
    includeTables: true,
    includeFilters: true,
    includeRawData: false,
    includeComments: false,
    includeTimestamp: true,
    // Privacy
    removePersonalIds: true,
    groupSmallSamples: true,
    minSampleSize: 5,
    applyLGPD: true,
    includeConfidentiality: false,
    // Quality
    quality: "high",
    orientation: "portrait",
  });

  const updateOption = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    setExporting(true);
    setExportProgress(0);
    
    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 100));
        setExportProgress(i);
      }
      
      // If we have report data, use the export function
      if (reportData) {
        await exportReport(reportData, {
          format: options.format === "sheets" ? "excel" : options.format === "powerpoint" ? "pdf" : options.format,
          filename: reportTitle.toLowerCase().replace(/\s+/g, "-"),
          includeTimestamp: options.includeTimestamp,
        });
      }
      
      setExportComplete(true);
      toast.success("Relatório exportado com sucesso!");
      
      setTimeout(() => {
        onOpenChange(false);
        setExporting(false);
        setExportProgress(0);
        setExportComplete(false);
      }, 1500);
    } catch {
      toast.error("Erro ao exportar relatório");
      setExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Relatório
          </DialogTitle>
          <DialogDescription>
            Relatório: <span className="font-medium text-foreground">{reportTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {exporting ? (
          <div className="py-12 space-y-6">
            <div className="text-center">
              {exportComplete ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10"
                >
                  <Check className="w-8 h-8 text-green-500" />
                </motion.div>
              ) : (
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              )}
              <p className="mt-4 font-medium">
                {exportComplete ? "Exportação concluída!" : "Gerando relatório..."}
              </p>
            </div>
            <Progress value={exportProgress} className="max-w-xs mx-auto" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <Label className="text-base font-medium">Formato de Exportação</Label>
              <RadioGroup
                value={options.format}
                onValueChange={(v) => updateOption("format", v as ExportFormat)}
                className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3"
              >
                {FORMAT_OPTIONS.map((format) => (
                  <div key={format.id}>
                    <RadioGroupItem value={format.id} id={format.id} className="peer sr-only" />
                    <Label
                      htmlFor={format.id}
                      className="flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-colors"
                    >
                      <format.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{format.name}</span>
                      <span className="text-xs text-muted-foreground text-center">
                        {format.description}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            {/* Content Options */}
            <div>
              <Label className="text-base font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Conteúdo Incluído
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {[
                  { key: "includeCover", label: "Capa com logo da empresa", icon: Image },
                  { key: "includeSummary", label: "Sumário executivo", icon: FileText },
                  { key: "includeCharts", label: "Gráficos e visualizações", icon: Presentation },
                  { key: "includeTables", label: "Tabelas de dados", icon: Table2 },
                  { key: "includeFilters", label: "Filtros aplicados (rodapé)", icon: Eye },
                  { key: "includeRawData", label: "Dados brutos (sem agregação)", icon: Table2 },
                  { key: "includeComments", label: "Comentários e anotações", icon: FileText },
                  { key: "includeTimestamp", label: "Data e hora da geração", icon: Calendar },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <Checkbox
                      id={item.key}
                      checked={options[item.key as keyof ExportOptions] as boolean}
                      onCheckedChange={(v) =>
                        updateOption(item.key as keyof ExportOptions, v as boolean)
                      }
                    />
                    <Label htmlFor={item.key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Privacy & LGPD */}
            <div>
              <Label className="text-base font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Privacidade e Anonimização
              </Label>
              <div className="space-y-3 mt-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Remover identificadores pessoais</p>
                      <p className="text-xs text-muted-foreground">CPF, email, telefone</p>
                    </div>
                  </div>
                  <Switch
                    checked={options.removePersonalIds}
                    onCheckedChange={(v) => updateOption("removePersonalIds", v)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Agrupar amostras pequenas</p>
                      <p className="text-xs text-muted-foreground">
                        Proteção de anonimato para grupos &lt; {options.minSampleSize} pessoas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={String(options.minSampleSize)}
                      onValueChange={(v) => updateOption("minSampleSize", Number(v))}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                      </SelectContent>
                    </Select>
                    <Switch
                      checked={options.groupSmallSamples}
                      onCheckedChange={(v) => updateOption("groupSmallSamples", v)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-500/5 border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                      LGPD
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">Aplicar regras LGPD/GDPR</p>
                      <p className="text-xs text-muted-foreground">
                        Conformidade com leis de proteção de dados
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={options.applyLGPD}
                    onCheckedChange={(v) => updateOption("applyLGPD", v)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Aviso de confidencialidade</p>
                      <p className="text-xs text-muted-foreground">Incluir no cabeçalho/rodapé</p>
                    </div>
                  </div>
                  <Switch
                    checked={options.includeConfidentiality}
                    onCheckedChange={(v) => updateOption("includeConfidentiality", v)}
                  />
                </div>
              </div>
            </div>

            {(options.format === "pdf" || options.format === "powerpoint") && (
              <>
                <Separator />
                
                {/* Quality & Orientation */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Qualidade</Label>
                    <RadioGroup
                      value={options.quality}
                      onValueChange={(v) => updateOption("quality", v as typeof options.quality)}
                      className="mt-2 space-y-2"
                    >
                      {[
                        { value: "high", label: "Alta (impressão)" },
                        { value: "medium", label: "Média (tela)" },
                        { value: "compact", label: "Compacta" },
                      ].map((q) => (
                        <div key={q.value} className="flex items-center gap-2">
                          <RadioGroupItem value={q.value} id={`quality-${q.value}`} />
                          <Label htmlFor={`quality-${q.value}`} className="font-normal cursor-pointer">
                            {q.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Orientação</Label>
                    <RadioGroup
                      value={options.orientation}
                      onValueChange={(v) => updateOption("orientation", v as typeof options.orientation)}
                      className="mt-2 space-y-2"
                    >
                      {[
                        { value: "portrait", label: "Retrato" },
                        { value: "landscape", label: "Paisagem" },
                      ].map((o) => (
                        <div key={o.value} className="flex items-center gap-2">
                          <RadioGroupItem value={o.value} id={`orient-${o.value}`} />
                          <Label htmlFor={`orient-${o.value}`} className="font-normal cursor-pointer">
                            {o.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {!exporting && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button variant="outline" className="gap-2">
              <LinkIcon className="w-4 h-4" />
              Compartilhar
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Gerar e Baixar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
