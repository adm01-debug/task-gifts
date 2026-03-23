import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useMemo } from "react";

interface TelemetryRow {
  id: string;
  operation: string;
  table_name: string | null;
  rpc_name: string | null;
  duration_ms: number;
  severity: string;
  created_at: string;
}

interface TelemetryChartsProps {
  rows: TelemetryRow[];
  timeFilter: string;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "#eab308", "hsl(var(--muted-foreground))"];

export function TelemetryCharts({ rows, timeFilter }: TelemetryChartsProps) {
  const durationByTable = useMemo(() => {
    const map = new Map<string, { name: string; avgMs: number; count: number; totalMs: number }>();
    for (const r of rows) {
      const key = r.rpc_name || r.table_name || "unknown";
      const prev = map.get(key) || { name: key, avgMs: 0, count: 0, totalMs: 0 };
      prev.count++;
      prev.totalMs += r.duration_ms;
      prev.avgMs = Math.round(prev.totalMs / prev.count);
      map.set(key, prev);
    }
    return [...map.values()].sort((a, b) => b.avgMs - a.avgMs).slice(0, 10);
  }, [rows]);

  const severityDistribution = useMemo(() => {
    const counts: Record<string, number> = { slow: 0, very_slow: 0, error: 0, normal: 0 };
    for (const r of rows) {
      counts[r.severity] = (counts[r.severity] || 0) + 1;
    }
    return [
      { name: "Normal", value: counts.normal || 0 },
      { name: "Lenta", value: counts.slow || 0 },
      { name: "Muito Lenta", value: counts.very_slow || 0 },
      { name: "Erro", value: counts.error || 0 },
    ].filter(d => d.value > 0);
  }, [rows]);

  const timeline = useMemo(() => {
    const buckets = new Map<string, { time: string; count: number; avgMs: number; totalMs: number }>();
    const fmt = timeFilter === "1h" || timeFilter === "6h" ? "HH:mm" : "dd/MM HH:mm";
    
    for (const r of rows) {
      const d = new Date(r.created_at);
      let key: string;
      if (timeFilter === "1h") {
        d.setMinutes(Math.floor(d.getMinutes() / 5) * 5, 0, 0);
        key = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      } else if (timeFilter === "6h") {
        d.setMinutes(Math.floor(d.getMinutes() / 15) * 15, 0, 0);
        key = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      } else {
        d.setMinutes(0, 0, 0);
        key = d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
      }
      
      const prev = buckets.get(key) || { time: key, count: 0, avgMs: 0, totalMs: 0 };
      prev.count++;
      prev.totalMs += r.duration_ms;
      prev.avgMs = Math.round(prev.totalMs / prev.count);
      buckets.set(key, prev);
    }
    return [...buckets.values()].reverse();
  }, [rows, timeFilter]);

  if (rows.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Timeline */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Queries ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} name="Quantidade" dot={false} />
              <Line type="monotone" dataKey="avgMs" stroke="hsl(var(--destructive))" strokeWidth={2} name="Média (ms)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Duration by Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Duração Média por Tabela (ms)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={durationByTable} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
              <Tooltip />
              <Bar dataKey="avgMs" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Média (ms)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Severity Pie */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Distribuição por Severidade</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={severityDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                {severityDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
