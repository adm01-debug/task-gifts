import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileSpreadsheet, FileText, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { exportReport, type ReportData, type ExportOptions } from "@/lib/exportReports";
import { cn } from "@/lib/utils";

interface ReportExportButtonProps {
  getReportData: () => ReportData | Promise<ReportData>;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
}

const exportFormats: { format: ExportOptions["format"]; label: string; icon: React.ReactNode }[] = [
  { format: "excel", label: "Excel (.xlsx)", icon: <FileSpreadsheet className="w-4 h-4 text-green-600" /> },
  { format: "csv", label: "CSV", icon: <FileText className="w-4 h-4 text-blue-600" /> },
  { format: "pdf", label: "PDF", icon: <FileText className="w-4 h-4 text-red-600" /> },
];

export function ReportExportButton({
  getReportData,
  className,
  variant = "outline",
  size = "default",
  disabled = false,
}: ReportExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const handleExport = async (format: ExportOptions["format"]) => {
    setIsExporting(true);
    setExportingFormat(format);

    try {
      const reportData = await getReportData();
      
      exportReport(reportData, {
        format,
        includeTimestamp: true,
      });

      toast.success(`Relatório exportado como ${format.toUpperCase()}`, {
        description: "O download foi iniciado automaticamente.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao exportar relatório", {
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isExporting}
          className={cn("gap-2", className)}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exportar
              <ChevronDown className="w-3 h-3 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        <AnimatePresence>
          {exportFormats.map((item, index) => (
            <motion.div
              key={item.format}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <DropdownMenuItem
                onClick={() => handleExport(item.format)}
                disabled={isExporting}
                className="gap-2 cursor-pointer"
              >
                {exportingFormat === item.format ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  item.icon
                )}
                <span>{item.label}</span>
              </DropdownMenuItem>
            </motion.div>
          ))}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Quick export buttons for common reports
interface QuickExportProps {
  data: Record<string, unknown>[];
  title: string;
  columns?: { key: string; label: string }[];
  generatedBy?: string;
}

export function QuickCSVExport({ data, title, columns, generatedBy = "Sistema" }: QuickExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    
    try {
      const reportData: ReportData = {
        title,
        generatedAt: new Date(),
        generatedBy,
        sections: [
          {
            title: "Dados",
            type: "table",
            data,
            columns,
          },
        ],
      };

      exportReport(reportData, { format: "csv", includeTimestamp: true });
      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar CSV");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-1.5"
    >
      {isExporting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      CSV
    </Button>
  );
}
