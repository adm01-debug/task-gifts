import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useFeedback360 } from "@/hooks/useFeedback360";
import { Badge } from "@/components/ui/badge";

export default function Feedback() {
  const navigate = useNavigate();
  const { cycles, pendingRequests, isLoading } = useFeedback360();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <MessageCircle className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Feedback 360°</h1>
      </header>

      <main className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Ciclos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {cycles.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum ciclo ativo</p>
            ) : (
              <div className="space-y-3">
                {cycles.map((cycle: any) => (
                  <div key={cycle.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{cycle.name}</h3>
                      <Badge>{cycle.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{cycle.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedbacks Pendentes ({pendingRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum feedback pendente</p>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((req: any) => (
                  <div key={req.id} className="p-3 border rounded-lg flex justify-between items-center">
                    <span>Feedback para {req.to_user_id}</span>
                    <Button size="sm">Responder</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
