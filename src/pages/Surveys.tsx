import { ArrowLeft, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PulseSurveyWidget } from "@/components/PulseSurveyWidget";
import { PageWrapper } from "@/components/PageWrapper";
import { SEOHead } from "@/components/SEOHead";
import { useSEO } from "@/hooks/useSEO";

export default function Surveys() {
  const navigate = useNavigate();
  const seoData = useSEO();

  return (
    <PageWrapper pageName="Pesquisas" className="min-h-screen bg-background">
      <SEOHead {...seoData} />
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <ClipboardList className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Pulse Surveys</h1>
      </header>

      <main className="p-4 md:p-6 max-w-4xl mx-auto">
        <PulseSurveyWidget />
      </main>
    </PageWrapper>
  );
}
